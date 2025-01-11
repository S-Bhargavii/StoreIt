"use server";
// import { UploadFileProps } from "@/types";
import { createAdminClient, createSessionClient } from "../appwrite";
import {InputFile} from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileURL, getFileType, getFileTypesParams, parseStringify } from "../utils";
import { error } from "console";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message:string) => {
    console.log(error, message);
    throw error;
}

const createQueries = (
    currentUser : Models.Document, 
    types:string[], 
    searchText:string="", 
    sort:string="$createdAt-desc", 
    limit?:number ) => {
    // fetch the documents that are owned by the user or have been shared to the user
    const queries = [
        Query.or(
            [Query.equal("owner", [currentUser.$id]),
            Query.contains("users", [currentUser.email])]
        )
    ];

    if(types.length > 0) queries.push(Query.equal("type", types));
    if(searchText) queries.push(Query.contains("name", searchText));
    if(limit) queries.push(Query.limit(limit));

    const [sortBy, orderBy] = sort.split("-");
    queries.push(
        orderBy==="asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );

    return queries;
}

export const uploadFile = async ({file, ownerId, accountId, path}:UploadFileProps)=>{
    const {storage, databases} = await createAdminClient();
    // Note - we use the storage functionality to store data and we use the database functionality to store the metadata of the file
    try{
        // the file that we give the function is a blob
        // this reads from the file and uploads to the appwrite's servers
        const inputFile = InputFile.fromBuffer(file, file.name);

        // storing the file in a bucket
        const bucketFile = await createFile(appwriteConfig.bucketId, ID.unique(), inputFile);
        
        const fileDocument = {
            name: bucketFile.name,
            url: constructFileURL(bucketFile.$id),
            type: getFileType(bucketFile.name).fileType,
            bucketFileId: bucketFile.$id,
            accountId: accountId,
            owner: ownerId,
            extension: getFileType(bucketFile.name).extension,
            size: bucketFile.sizeOriginal,
            users:[],
        }

        const newFile = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.filesCollectionId,
            ID.unique(),
            fileDocument,
            
        ).catch(async (error:unknown) => {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
            handleError(error, "Failed to create file");
        })

        revalidatePath(path);
        return parseStringify(newFile);
    }catch(error){
        handleError(error, "Failed to upload file");
    }
}

const createFile = async (bucketId:string, id:string, file:File) => {
    const MAX_ATTEMPTS = 10;
    const {storage} = await createAdminClient();

    // retry for 10 times to upload before throwing an error
    for(let i=0; i<MAX_ATTEMPTS; i++){
        try{
            const bucketFile = await storage.createFile(bucketId, id, file);
            return bucketFile;
        }catch(error){
            if(i === MAX_ATTEMPTS - 1) throw error;
            console.warn(`Retrying upload...Attempt ${i+1}...Error ${error}`);
        }
    }
    throw error;
}

export const getFiles = async(type:string="", searchText:string="", sort:string="$createdAt-desc", limit?:number) => {
    const {databases} = await createAdminClient();
    const types = getFileTypesParams(type);
    try{
        const currentUser = await getCurrentUser();

        if(!currentUser) throw new Error("User not found");

        const queries = createQueries(currentUser, types, searchText, sort, limit);

        const files = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, queries);
        
        // fetch metadata for the files
        return parseStringify(files);
    } catch(error){
        handleError(error, "Failed to get files");
    }
}

export const renameFile = async({fileId, name, extension, path}:{fileId:string, name:string, extension:string, path:string}) => {
    const {databases}  = await createAdminClient();
    try{
        const newName = `${name}.${extension}`;
        const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId,{name:newName});
        revalidatePath(path);
        return parseStringify(updatedFile);
    }catch(error){
        handleError(error, "Failed to rename file");
    }
}

export const updateFileUsers = async({fileId, emails, path}:{fileId:string, emails:string[], path:string}) => {
    const {databases}  = await createAdminClient();
    try{
        const updatedFile = await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId,{users:emails});
        revalidatePath(path);
        return parseStringify(updatedFile);
    }catch(error){
        handleError(error, "Failed to update users who have access to the file");
    }
}

export const deleteFile = async({fileId, bucketFileId, path}:{fileId:string, bucketFileId:string, path:string}) =>{
    const {databases, storage} = await createAdminClient();

    try{
        const deletedFile = await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.filesCollectionId, fileId);
        if(deletedFile){
            await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
        }
        revalidatePath(path);
        return true;
    }catch(error){
        handleError(error, "Failed to delete file");
    }
}

export const getTotalSpace = async() => {
    try{
        const {databases} = await createSessionClient();
        const currentUser = await getCurrentUser();
        if(!currentUser) throw new Error("User is not authenticated");

        const files = await databases.listDocuments(
            appwriteConfig.databaseId, 
            appwriteConfig.filesCollectionId,
            [Query.equal("owner", [currentUser.$id])]
        );

        const totalSpace = {
            image: {size:0, latestDate:""},
            document: {size:0, latestDate:""},
            video: {size:0, latestDate:""},
            audio: {size:0, latestDate:""},
            other: {size:0, latestDate:""},
            used: 0,
            all: 2 * 1024 * 1024 * 1024 
        };

        files.documents.forEach((file)=>{
            const fileType = file.type as FileType; 
            // this is type casting to FileType - unknownthing not there in filetype would result in an error
            totalSpace[fileType].size += file.size;
            totalSpace.used += file.size

            if(!totalSpace[fileType].latestDate || new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)){
                totalSpace[fileType].latestDate = file.$updatedAt;
            }
        })

        return parseStringify(totalSpace);
    }catch(error){
        handleError(error, "Error calculating total space used.");
    }
}