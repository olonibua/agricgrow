import { Client, Account, Databases, ID, Query, Storage } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export ID for convenience
export { ID };

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const FARMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_FARMERS_COLLECTION_ID || '';
export const IMF_COLLECTION_ID = process.env.NEXT_PUBLIC_IMF_COLLECTION_ID || '';
export const LOANS_COLLECTION_ID = process.env.NEXT_PUBLIC_LOANS_COLLECTION_ID || '';
export const LOAN_APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_LOAN_APPLICATIONS_COLLECTION_ID || '';

// Add this function to implement retry logic for network operations
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Attempt ${attempt} failed: ${errorMessage}. Retrying in ${delay}ms...`);
      
      // If it's not a network error, don't retry
      if (!(error instanceof Error) || 
          !errorMessage.includes('Failed to fetch') && 
          !errorMessage.includes('network') &&
          !errorMessage.includes('ERR_NETWORK')) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt (exponential backoff)
      delay *= 2;
    }
  }
  
  throw lastError;
}

// Authentication helper functions
export async function createAccount(
  email: string, 
  password: string, 
  name: string, 
  userType: 'farmer' | 'imf',
  additionalData?: {
    phone?: string;
    address?: string;
    state?: string;
    lga?: string;
  }
) {
  try {
    // Create the account with retry logic
    const newAccount = await withRetry(() => 
      account.create(
        ID.unique(),
        email,
        password,
        name
      )
    );
    
    // Store additional user data based on type
    if (userType === 'farmer') {
      await withRetry(() => 
        databases.createDocument(
          DATABASE_ID,
          FARMERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: newAccount.$id,
            name,
            email,
            phone: additionalData?.phone || null,
            address: additionalData?.address || null,
            state: additionalData?.state || null,
            lga: additionalData?.lga || null,
            registrationDate: new Date().toISOString(),
            status: 'active',
            farmSize: 0,
            primaryCrop: '',
            secondaryCrop: '',
            hasIrrigation: false,
            creditScore: 65
          }
        )
      );
    } else {
      await withRetry(() => 
        databases.createDocument(
          DATABASE_ID,
          IMF_COLLECTION_ID,
          ID.unique(),
          {
            userId: newAccount.$id,
            name,
            email,
            registrationDate: new Date().toISOString(),
            status: 'pending' // IMF Partners need approval
          }
        )
      );
    }
    
    return newAccount;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logout() {
  try {
    return await account.deleteSession('current');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserProfile(userId: string, userType: 'farmer' | 'imf') {
  try {
    const collectionId = userType === 'farmer' ? FARMERS_COLLECTION_ID : IMF_COLLECTION_ID;
    
    const documents = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [Query.equal('userId', userId)]
    );
    
    return documents.documents[0];
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function createLoanApplication(data: Record<string, unknown>) {
  try {
    console.log("Creating loan application with data:", {
      ...data,
      riskExplanation: data.riskExplanation
    });
    
    // Make sure all required fields are present
    const requiredFields = [
      'farmerId', 'amount', 'purpose', 'cropType', 
      'farmSize', 'riskScore', 'status'
    ];
    
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Create the loan application document
    const loanApplication = await databases.createDocument(
      DATABASE_ID,
      LOAN_APPLICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        ...data,
        // Make sure riskExplanation is included
        riskExplanation: data.riskExplanation || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    
    // After creating the document, log the result
    console.log("Created loan application:", loanApplication);
    return loanApplication;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error creating loan application';
    console.error('Error creating loan application:', errorMessage);
    throw error;
  }
}

export async function getLoanApplications(userId: string) {
  try {
    // First try to get the farmer profile to get the farmerId
    let farmerId = userId;
    try {
      const farmerProfile = await getFarmerProfile(userId);
      if (farmerProfile) {
        farmerId = farmerProfile.$id;
      }
    } catch {
      console.log("Could not find farmer profile, using userId as farmerId");
    }
    
    // Query using farmerId instead of userId
    const response = await databases.listDocuments(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      [
        Query.equal('farmerId', farmerId)
      ]
    );
    
    console.log("Loan applications fetched:", response.documents);
    return response.documents;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching loan applications';
    console.error("Error fetching loan applications:", errorMessage);
    return [];
  }
}

export async function getAllLoanApplications() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      LOANS_COLLECTION_ID
    );
    return response.documents;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching all loan applications';
    console.error('Error fetching all loan applications:', errorMessage);
    return [];
  }
}

export async function updateLoanApplication(loanId: string, data: Record<string, unknown>) {
  try {
    return await databases.updateDocument(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      loanId,
      data
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error updating loan application';
    console.error('Error updating loan application:', errorMessage);
    throw error;
  }
}

// Get farmer profile by user ID
export async function getFarmerProfile(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      FARMERS_COLLECTION_ID,
      [
        Query.equal('userId', userId)
      ]
    );
    
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    
    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching farmer profile';
    console.error('Error fetching farmer profile:', errorMessage);
    throw error;
  }
}

export async function getLoanApplication(id: string) {
  try {
    const loan = await databases.getDocument(
      DATABASE_ID,
      LOAN_APPLICATIONS_COLLECTION_ID,
      id
    );
    console.log("Retrieved loan from database:", loan);
    return loan;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error getting loan application';
    console.error('Error getting loan application:', errorMessage);
    throw error;
  }
}