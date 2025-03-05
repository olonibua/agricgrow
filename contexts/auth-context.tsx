'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, databases } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { ID, Query } from 'appwrite';
import { FARMERS_COLLECTION_ID, DATABASE_ID, IMF_COLLECTION_ID } from '@/lib/appwrite';

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

  // Helper function to get user profile
  const getUserProfile = async (userId: string, type: 'farmer' | 'imf') => {
    try {
      const collectionId = type === 'farmer' ? FARMERS_COLLECTION_ID : IMF_COLLECTION_ID;
      const response = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        [Query.equal('userId', userId)]
      );
      
      return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error: unknown) {
      console.error(`Error getting ${type} profile:`, error);
      return null;
    }
  };

  // Check user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try to get current user
        const currentUser = await account.get();
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
      } catch (error: unknown) {
        // No active session
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
      
      // Create session
      await account.createEmailPasswordSession(email, password);
      
      // Get user details
      const currentUser = await account.get();
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
      
      // Create the account in Appwrite Auth
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
    } catch (error: unknown ) {
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