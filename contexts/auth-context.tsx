'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, createAccount, FARMERS_COLLECTION_ID, DATABASE_ID, getCurrentUser, getUserProfile } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      
      // If it's not a network error, don't retry
      if (!error.message?.includes('Failed to fetch') && 
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
      
      // Create the account in Appwrite Auth
      const newAccount = await createAccount(email, password, name, 'farmer');
      
      // Update the farmer profile with additional data if provided
      if (additionalData && newAccount.$id) {
        // Find the farmer document by userId
        const response = await databases.listDocuments(
          DATABASE_ID,
          FARMERS_COLLECTION_ID,
          [Query.equal('userId', newAccount.$id)]
        );
        
        if (response.documents.length > 0) {
          const farmerDoc = response.documents[0];
          
          // Update the document with additional data
          await databases.updateDocument(
            DATABASE_ID,
            FARMERS_COLLECTION_ID,
            farmerDoc.$id,
            {
              phone: additionalData.phone || null,
              address: additionalData.address || null,
              state: additionalData.state || null,
              lga: additionalData.lga || null
            }
          );
        }
      }
      
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
      await createAccount(email, password, name, 'imf', additionalData);
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