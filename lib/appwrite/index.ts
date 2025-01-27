"use server";

import {Account, Avatars, Client, Databases, Storage} from "node-appwrite";
import { appwriteConfig } from "./config";
import { cookies } from "next/headers";

// this client is linked to a specific user -- this restricts the methods ( parts or operations on the database ) that the user can do
export const createSessionClient = async() => {
    const client = new Client().
                    setEndpoint(appwriteConfig.endpointUrl).
                    setProject(appwriteConfig.projectId);
                    
    let attempts = 10;
    let session = null;
    
    while (attempts > 0) {
        try {
            session = (await cookies()).get("appwrite-session");
            if (session?.value) {
                break; // Exit the loop if a valid session is found
            }
            throw new Error("No session exists");
        } catch (error) {
            console.info("failed to get session info.... trying again");
            console.debug(error);
            attempts -= 1;
        }
    }
    
    if (!session?.value) {
        throw new Error("No session exists after maximum retry attempts");
    }

    client.setSession(session.value);
    return{
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        }
    }
}

export const createAdminClient = async() => {
    const client = new Client().
                    setEndpoint(appwriteConfig.endpointUrl).
                    setProject(appwriteConfig.projectId).
                    setKey(appwriteConfig.apikey);
                    
    return{
        get account(){
            return new Account(client);
        },
        get databases(){
            // this returns an object that gives us methods to use 
            // related to dealing with databases
            return new Databases(client);
        },
        get storage(){
            return new Storage(client);
        }, 
        get avatars(){
            return new Avatars(client);
        }
    }
}