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
export { ID, Query };

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
  } catch (error: unknown ) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error: unknown) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function logout() {
  try {
    return await account.deleteSession('current');
  } catch (error: unknown) {
    console.error('Error logging out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
    
    // Parse the repayment schedule for each loan
    return response.documents.map(doc => {
      if (doc.repaymentScheduleJson) {
        doc.repaymentSchedule = JSON.parse(doc.repaymentScheduleJson);
      }
      return doc;
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching loan applications';
    console.error('Error fetching loan applications:', errorMessage);
    return [];
  }
}

export async function updateLoanApplication(loanId: string, data: Record<string, any>) {
  try {
    // If repaymentSchedule exists in the data, stringify it
    if (data.repaymentSchedule) {
      // Convert the repayment schedule to a JSON string
      data.repaymentScheduleJson = JSON.stringify(data.repaymentSchedule);
      // Remove the original array to avoid the error
      delete data.repaymentSchedule;
    }
    
    // Update the document with the stringified data
    const response = await databases.updateDocument(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      loanId,
      data
    );
    
    return response;
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

export async function getLoanApplication(loanId: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      loanId
    );
    
    // Parse the repayment schedule if it exists
    if (response.repaymentScheduleJson) {
      response.repaymentSchedule = JSON.parse(response.repaymentScheduleJson);
    }
    
    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching loan application';
    console.error('Error fetching loan application:', errorMessage);
    throw error;
  }
}

// Add a function to update a loan application's risk explanation
export async function updateLoanRiskExplanation(loanId: string, riskScore: number, formData: Record<string, unknown>) {
  try {
    // Generate a new risk explanation that matches the risk score
    const riskExplanation = generateRiskExplanation(riskScore, formData);
    
    // Update the loan application in the database
    const updatedLoan = await databases.updateDocument(
      DATABASE_ID,
      LOAN_APPLICATIONS_COLLECTION_ID,
      loanId,
      { riskExplanation }
    );
    
    return updatedLoan;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error updating loan risk explanation';
    console.error('Error updating loan risk explanation:', errorMessage);
    throw error;
  }
}

// Helper function to generate risk explanation based on risk score
export function generateRiskExplanation(riskScore: number, formData: Record<string, unknown>) {
  // Normalize the score to ensure consistency
  const normalizedScore = riskScore;
  let riskLevel;
  
  if (normalizedScore <= 20) riskLevel = "Very low";
  else if (normalizedScore <= 40) riskLevel = "Low";
  else if (normalizedScore <= 60) riskLevel = "Moderate";
  else if (normalizedScore <= 80) riskLevel = "High";
  else riskLevel = "Very high";
  
  let explanation = `${riskLevel} risk. `;
  
  // Add specific risk factors based on the score and form data
  if (normalizedScore > 60) {
    explanation += "The loan amount is high relative to farm size, and there are significant concerns about repayment capacity. ";
  } else if (normalizedScore > 40) {
    explanation += "The loan has moderate risk factors that should be considered. ";
  } else {
    explanation += "This application shows favorable risk indicators. ";
  }
  
  explanation += "Risk factors include: ";
  
  // Add specific risk factors
  const riskFactors = [];
  
  if (formData.hasCollateral === false) {
    riskFactors.push("No collateral increases financial risk");
  }
  
  if (formData.hasPreviousLoan === true) {
    riskFactors.push("Existing loan obligations may affect repayment capacity");
  }
  
  const cropType = formData.cropType as string;
  if (formData.hasIrrigation === false && ['rice', 'tomato'].includes(cropType)) {
    riskFactors.push(`${cropType} cultivation without irrigation poses crop failure risk`);
  }
  
  // Join risk factors or provide default message
  if (riskFactors.length > 0) {
    explanation += riskFactors.join('; ') + '.';
  } else {
    explanation += "No significant risk factors identified.";
  }
  
  return explanation;
}

export async function updateLoanRepayment(loanId: string, repaymentId: string, data: Record<string, unknown>) {
  try {
    // First get the current loan document
    const loan = await databases.getDocument(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      loanId
    );
    
    // Update the specific repayment in the repaymentSchedule array
    const updatedRepaymentSchedule = loan.repaymentSchedule.map((repayment: any) => {
      if (repayment.id === repaymentId) {
        return { ...repayment, ...data };
      }
      return repayment;
    });
    
    // Update the loan document with the new repayment schedule
    return await databases.updateDocument(
      DATABASE_ID,
      LOANS_COLLECTION_ID,
      loanId,
      { repaymentSchedule: updatedRepaymentSchedule }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error updating loan repayment';
    console.error('Error updating loan repayment:', errorMessage);
    throw error;
  }
}