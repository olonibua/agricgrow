 import { Client, Databases, Account, Storage } from "appwrite";

 // Initialize the Appwrite client
 const client = new Client()
   .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
   .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

 // Initialize Appwrite services
 export const account = new Account(client);
 export const databases = new Databases(client);
 export const storage = new Storage(client);
 export { ID } from "appwrite";