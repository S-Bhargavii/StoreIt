"use server";
import { UploadFileProps } from "@/types";
import { createAdminClient } from "../appwrite";
import {InputFile} from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID } from "node-appwrite";
import { constructFileURL, convertFileToURL, getFileType, parseStringify } from "../utils";
import { error } from "console";
import { revalidatePath } from "next/cache";

const handleError = (error: any, message:string) => {
    console.log(error, message);
    throw error;
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
            bucketField: bucketFile.$id,
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