'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, FARMERS_COLLECTION_ID, DATABASE_ID, getCurrentUser, getUserProfile, IMF_COLLECTION_ID } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      
      // If it's not a network error, don't retry
      if (!(error instanceof Error) || 
          !error.message?.includes('Failed to fetch') && 
          !error.message?.includes('network') &&
          !error.message?.includes('ERR_')) {
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

type UserType = 'farmer' | 'imf' | null;

interface AuthContextType {
  user: any;
  userType: UserType;
  userProfile: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerFarmer: (
    email: string, 
    password: string, 
    name: string,
    additionalData?: {
      phone?: string;
      address?: string;
      state?: string;
      lga?: string;
    }
  ) => Promise<any>;
  registerIMF: (
    email: string, 
    password: string, 
    name: string,
    additionalData?: {
      phone?: string;
      address?: string;
      state?: string;
      registrationNumber?: string;
      contactPersonName?: string;
      contactPersonEmail?: string;
      contactPersonPhone?: string;
    }
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try to get the current session
        const currentSession = await withRetry(() => 
          account.getSession('current')
        ).catch(() => null);
        
        if (currentSession) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            
            // Check if user is a farmer
            const farmerProfile = await getUserProfile(currentUser.$id, 'farmer');
            if (farmerProfile) {
              setUserType('farmer');
              setUserProfile(farmerProfile);
            } else {
              // Check if user is an IMF
              const imfProfile = await getUserProfile(currentUser.$id, 'imf');
              if (imfProfile) {
                setUserType('imf');
                setUserProfile(imfProfile);
              }
            }
          }
        }
      } catch (error: unknown) {
        console.error('Error checking user:', error);
        // Clear state on error
        setUser(null);
        setUserType(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First check if there's an active session and delete it if needed
      try {
        const currentSession = await account.getSession('current');
        if (currentSession) {
          // If the session exists but is for a different user, delete it
          await account.deleteSession('current');
        }
      } catch (sessionError) {
        // If there's no session or error checking, just continue with login
        console.log("No active session found or error checking session");
      }
      
      // Now create the new session
      await withRetry(() => 
        account.createEmailPasswordSession(email, password)
      );
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is a farmer
        const farmerProfile = await getUserProfile(currentUser.$id, 'farmer');
        if (farmerProfile) {
          setUserType('farmer');
          setUserProfile(farmerProfile);
          router.push('/dashboard');
        } else {
          // Check if user is an IMF
          const imfProfile = await getUserProfile(currentUser.$id, 'imf');
          if (imfProfile) {
            setUserType('imf');
            setUserProfile(imfProfile);
            router.push('/imf-dashboard');
          }
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserType(null);
      setUserProfile(null);
      router.push('/');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const registerFarmer = async (
    email: string, 
    password: string, 
    name: string,
    additionalData?: {
      phone?: string;
      address?: string;
      state?: string;
      lga?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      
      // Create the account in Appwrite Auth - fix argument count
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Then create the farmer profile document
      await databases.createDocument(
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
      );
      
      // Login after registration
      await login(email, password);
      
      return newAccount;
    } catch (error: unknown) {
      console.error('Farmer registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerIMF = async (
    email: string, 
    password: string, 
    name: string,
    additionalData?: {
      phone?: string;
      address?: string;
      state?: string;
      registrationNumber?: string;
      contactPersonName?: string;
      contactPersonEmail?: string;
      contactPersonPhone?: string;
    }
  ) => {
    try {
      setIsLoading(true);
      // Fix argument count - Appwrite account.create only accepts 4 arguments
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Create IMF profile document
      await databases.createDocument(
        DATABASE_ID,
        IMF_COLLECTION_ID,
        ID.unique(),
        {
          userId: newAccount.$id,
          name,
          email,
          phone: additionalData?.phone || null,
          address: additionalData?.address || null,
          state: additionalData?.state || null,
          registrationNumber: additionalData?.registrationNumber || null,
          contactPersonName: additionalData?.contactPersonName || null,
          contactPersonEmail: additionalData?.contactPersonEmail || null,
          contactPersonPhone: additionalData?.contactPersonPhone || null,
          registrationDate: new Date().toISOString(),
          status: 'pending' // IMF Partners need approval
        }
      );
      
      await login(email, password);
    } catch (error: unknown) {
      console.error('IMF registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userType,
      userProfile,
      isLoading,
      login,
      logout,
      registerFarmer,
      registerIMF
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

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