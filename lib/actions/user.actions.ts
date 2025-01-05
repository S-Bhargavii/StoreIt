'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

// Create user account flow 
// 1. User enters full name and email
// 2. Check if the user already exist using the email
// 3. Send OTP the user's email
// 4. This will send a secret key for creating a session.
// 5. Create a new user document if the user is a new user.
// 6. return the user's accountId that will be used to complete the login.
// 7. Verify the OTP and authenticate login

const getUserByEmail = async(email:string) => {
    // create a database object
    const {databases} = await createAdminClient();

    // search for the name in the collection
    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", email)]
    )

    return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error: any, message:string) => {
    console.log(error, message);
    throw error;
}

export const sendEmailOTP = async(email: string) => {
    const {account} = await createAdminClient();

    try{
        // NOTE - appwrite has its own account management db.
        const session = account.createEmailToken(ID.unique(), email);
        return (await session).userId;
    }catch(error){
        handleError(error, "Failed to send email OTP ");
    }
}

export const createAccount = async({fullName, email}:{fullName: string, email:string}) => {
    // TO DO : improve this 
    // 1. Only create the user in the database if the otp is correct -- verify otp before adding user to database
    // 2. If user already exists, prompt user to sign in instead
    const existingUser = await getUserByEmail(email);
    const accountId = await sendEmailOTP(email);
    if(!accountId) throw new Error("Failed to send OTP");

    // add user to the users database if its a non existing user
    if(!existingUser){
        const {databases} = await createAdminClient();
        await databases.createDocument(appwriteConfig.databaseId, 
            appwriteConfig.usersCollectionId, 
            ID.unique(),
            {
                fullName,
                email, 
                avatar : avatarPlaceholderUrl,
                accountId
            }
        );
    }

    return parseStringify({accountId});
}

export const verifyOTP = async(accountId:string, password:string)=>{
    try{
        const {account}  = await createAdminClient();
        // checks if the OTP is correct -- if correct --> creates a session and returns the session id
        const session = await account.createSession(accountId, password);

        (await cookies()).set("appwrite-session", session.secret,{
            path:"/",
            httpOnly: true,
            sameSite: "strict",
            secure: true
        });

        return parseStringify({sessionId: session.$id});
    } catch(error){
        handleError(error, "Failed to verify OTP");
    }
}

export const getCurrentUser = async() => {
    // we get the client of the session that is currently signed in
    try{
        const {databases, account} = await createSessionClient();

        const result = await account.get();

        const user = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal("accountId", result.$id)]
        );

        if(user.total <= 0) return null;
        return parseStringify(user.documents[0]);
    }catch(error){
        // console.error(error);
        return null;
    }
    
}

export const signOutUser = async() => {
    const {account} = await createSessionClient();
    console.log("signing out... bye")

    try{
        account.deleteSession('current');
        (await cookies()).delete("appwrite-session");
    }catch(error){
        handleError(error, "Failed to sign out user");
    }finally{
        redirect("/sign-in");
    }
}

export const signInUser = async({email} :{email:string}) => {
    try{
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            // if the user exists, send OTP 
            await sendEmailOTP(email);
            return parseStringify({accountId: existingUser.accountId});
        }
        return parseStringify({accountId:null, error:"User not found"});
    }catch(error){
        handleError(error, "Failed to sign in user");
    }
}