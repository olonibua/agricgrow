'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PersonalInfoForm from '@/components/loan-application/personal-info-form';
import LoanDetailsForm from '@/components/loan-application/loan-details-form';
import FarmDetailsForm from '@/components/loan-application/farm-details-form';
import BusinessPlanForm from '@/components/loan-application/business-plan-form';
import CollateralForm from '@/components/loan-application/collateral-form';
import GuarantorForm from '@/components/loan-application/guarantor-form';
import DeclarationForm from '@/components/loan-application/declaration-form';
import { createLoanApplication } from '@/lib/appwrite';


export default function LoanApplicationPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    email: '',
    phone: '',
    farmerId: '',
    address: '',
    state: '',
    lga: '',
    
    // Loan Details
    loanType: '',
    amount: '',
    purpose: '',
    repaymentPeriod: '',
    
    // Farm Details
    farmingType: '',
    cropType: '',
    livestockType: '',
    farmSize: '',
    farmLocation: '',
    hasIrrigation: false,
    
    // Business Plan
    expectedHarvestDate: '',
    estimatedYield: '',
    estimatedRevenue: '',
    marketStrategy: '',
    
    // Collateral
    hasCollateral: false,
    collateralType: '',
    collateralValue: '',
    
    // Guarantor
    guarantorName: '',
    guarantorPhone: '',
    guarantorAddress: '',
    guarantorRelationship: '',
    
    // Declarations
    hasInsurance: false,
    hasPreviousLoan: false,
    agreeToTerms: false
  });
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // First, check if we have saved form data in localStorage
    const savedData = localStorage.getItem('loanApplicationData');
    let initialFormData = { ...formData };
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("Saved form data from localStorage:", parsedData);
        initialFormData = { ...initialFormData, ...parsedData };
        
        // If there's saved data, check if we can resume from a specific tab
        const savedTab = localStorage.getItem('loanApplicationActiveTab');
        if (savedTab) {
          setActiveTab(savedTab);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Error parsing saved form data';
        console.error('Error parsing saved form data:', errorMessage);
      }
    }
    
    // Then, if we have user profile data, it should override localStorage data
    if (userProfile) {
      console.log("User profile data available:", userProfile);
      
      // Update form data with all available profile fields
      initialFormData = {
        ...initialFormData,
        fullName: userProfile.name || user?.name || initialFormData.fullName,
        email: userProfile.email || user?.email || initialFormData.email,
        phone: userProfile.phone || initialFormData.phone,
        farmerId: userProfile.$id || initialFormData.farmerId,
        address: userProfile.address || initialFormData.address,
        state: userProfile.state || initialFormData.state,
        lga: userProfile.lga || initialFormData.lga,
        farmSize: userProfile.farmSize?.toString() || initialFormData.farmSize,
        hasIrrigation: userProfile.hasIrrigation || initialFormData.hasIrrigation,
      };
      
      console.log("Final form data with profile overrides:", initialFormData);
    } else {
      console.log("No user profile data available");
    }
    
    // Set the form data with all the merged information
    setFormData(initialFormData);
    
    // Clear localStorage to prevent it from overriding profile data in the future
    localStorage.removeItem('loanApplicationData');
  }, [userProfile, user]);
  
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('loanApplicationData', JSON.stringify(formData));
  }, [formData]);
  
  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('loanApplicationActiveTab', activeTab);
  }, [activeTab]);
  
  const updateFormData = (section: string, data: Record<string, unknown>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };
  
  const nextTab = (current: string) => {
    const tabs = ["personal", "loan", "farm", "business", "collateral", "guarantor", "declaration"];
    const currentIndex = tabs.indexOf(current);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  const prevTab = (current: string) => {
    const tabs = ["personal", "loan", "farm", "business", "collateral", "guarantor", "declaration"];
    const currentIndex = tabs.indexOf(current);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  // Update the risk explanation generation to match the risk score
  const generateRiskExplanation = (riskScore: number, formData: Record<string, unknown>) => {
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
    const riskFactors = [];
    
    // Add risk factors based on form data
    if (normalizedScore > 60) {
      explanation += "The loan amount is high relative to farm size, and there are concerns about repayment capacity. ";
    } else if (normalizedScore > 40) {
      explanation += "The loan has moderate risk factors that should be considered. ";
    } else {
      explanation += "This application shows favorable risk indicators. ";
    }
    
    explanation += "Risk factors include: ";
    
    // Add specific risk factors
    if (!formData.hasCollateral) {
      riskFactors.push("No collateral increases financial risk");
    }
    
    if (formData.hasPreviousLoan) {
      riskFactors.push("Existing loan obligations may affect repayment capacity");
    }
    
    if (!formData.hasIrrigation && ['rice', 'tomato'].includes(formData.cropType as string)) {
      riskFactors.push(`${formData.cropType} cultivation without irrigation poses crop failure risk`);
    }
    
    // Join risk factors or provide default message
    if (riskFactors.length > 0) {
      explanation += riskFactors.join('; ') + '.';
    } else {
      explanation += "No significant risk factors identified.";
    }
    
    return explanation;
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!formData.purpose || !formData.amount || !formData.cropType) {
        setError("Please fill in all required fields");
        return;
      }

      if (!formData.agreeToTerms) {
        setError("You must agree to the terms and conditions");
        return;
      }

      // Calculate risk score (0-100 scale)
      const calculateRiskScore = () => {
        // Parse values
        const loanAmount = parseFloat(formData.amount) || 0;
        const farmSize = parseFloat(formData.farmSize) || 1; // Default to 1 to avoid division by zero
        const estimatedRevenue = parseFloat(formData.estimatedRevenue) || 0;
        
        // Base risk factors
        let score = 50; // Start at moderate risk (50%)
        
        // Loan-to-farm-size ratio (higher ratio = higher risk)
        // Assuming ₦200,000 per hectare is a reasonable amount
        const loanPerHectare = loanAmount / farmSize;
        if (loanPerHectare > 300000) score += 20;
        else if (loanPerHectare > 200000) score += 10;
        else if (loanPerHectare < 100000) score -= 10;
        
        // Loan-to-revenue ratio (higher ratio = higher risk)
        // Loan should ideally be less than 50% of expected revenue
        const loanToRevenueRatio = loanAmount / (estimatedRevenue || 1);
        if (loanToRevenueRatio > 0.7) score += 15;
        else if (loanToRevenueRatio > 0.5) score += 5;
        else if (loanToRevenueRatio < 0.3) score -= 10;
        
        // Irrigation reduces risk for water-dependent crops
        if (formData.hasIrrigation) {
          score -= 10;
        } else if (['rice', 'tomato'].includes(formData.cropType as string)) {
          score += 15; // Higher risk for water-dependent crops without irrigation
        }
        
        // Collateral reduces risk
        if (formData.hasCollateral) {
          score -= 15;
        }
        
        // Insurance reduces risk
        if (formData.hasInsurance) {
          score -= 10;
        }
        
        // Previous loans might indicate higher risk
        if (formData.hasPreviousLoan) {
          score += 5;
        }
        
        // Ensure score is between 0-100
        return Math.min(Math.max(Math.round(score), 0), 100);
      };

      const riskScore = calculateRiskScore();
      
      // Generate risk explanation based on the calculated score
      const riskExplanation = generateRiskExplanation(riskScore, formData);
      console.log("Risk explanation:", riskExplanation); // Add this for debugging
      console.log("Risk score:", riskScore);
      console.log("Form data used for explanation:", {
        hasIrrigation: formData.hasIrrigation,
        hasCollateral: formData.hasCollateral,
        hasPreviousLoan: formData.hasPreviousLoan,
        hasInsurance: formData.hasInsurance
      });

      // Create loan application in Appwrite - match the schema exactly
      const loanApplication = {
        farmerId: userProfile.$id,
        userId: userProfile.userId,
        fullName: userProfile.name || formData.fullName,
        amount: parseFloat(formData.amount),
        cropType: formData.cropType,
        farmSize: parseFloat(formData.farmSize),
        riskScore: riskScore,
        riskExplanation: riskExplanation, // Make sure this is included
        email: formData.email || userProfile.email,
        phone: formData.phone || userProfile.phone,
        address: formData.address || userProfile.address,
        lga: formData.lga || userProfile.lga,
        state: formData.state || userProfile.state,
        purpose: formData.purpose,
        farmingType: formData.farmingType,
        farmLocation: formData.farmLocation,
        hasIrrigation: formData.hasIrrigation,
        expectedHarvestDate: formData.expectedHarvestDate,
        estimatedYield: parseFloat(formData.estimatedYield) || 0,
        estimatedRevenue: parseFloat(formData.estimatedRevenue) || 0,
        marketStrategy: formData.marketStrategy,
        status: "pending",
        applicationDate: new Date().toISOString(),
      };

      console.log("Creating loan application with risk explanation:", loanApplication);
      const createdLoan = await createLoanApplication(loanApplication);
      console.log("Loan application created successfully:", createdLoan);

      // Clear saved form data after successful submission
      localStorage.removeItem("loanApplicationData");
      localStorage.removeItem("loanApplicationActiveTab");

      router.push("/dashboard?tab=applications");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      console.error('Error submitting application:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Agricultural Loan Application</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-7 mb-8">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="loan">Loan</TabsTrigger>
              <TabsTrigger value="farm">Farm</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="collateral">Collateral</TabsTrigger>
              <TabsTrigger value="guarantor">Guarantor</TabsTrigger>
              <TabsTrigger value="declaration">Declaration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <PersonalInfoForm
                data={formData} 
                updateData={(data) => updateFormData('personal', data)} 
                onNext={() => nextTab('personal')} 
              />
            </TabsContent>
            
            <TabsContent value="loan">
              <LoanDetailsForm 
                data={formData} 
                updateData={(data) => updateFormData('loan', data)} 
                onNext={() => nextTab('loan')} 
                onPrev={() => prevTab('loan')} 
              />
            </TabsContent>
            
            <TabsContent value="farm">
              <FarmDetailsForm 
                data={formData} 
                updateData={(data) => updateFormData('farm', data)} 
                onNext={() => nextTab('farm')} 
                onPrev={() => prevTab('farm')} 
              />
            </TabsContent>
            
            <TabsContent value="business">
              <BusinessPlanForm 
                data={formData} 
                updateData={(data) => updateFormData('business', data)} 
                onNext={() => nextTab('business')} 
                onPrev={() => prevTab('business')} 
              />
            </TabsContent>
            
            <TabsContent value="collateral">
              <CollateralForm   
                data={formData} 
                updateData={(data) => updateFormData('collateral', data)} 
                onNext={() => nextTab('collateral')} 
                onPrev={() => prevTab('collateral')} 
              />
            </TabsContent>
            
            <TabsContent value="guarantor">
              <GuarantorForm  
                data={formData} 
                updateData={(data) => updateFormData('guarantor', data)} 
                onNext={() => nextTab('guarantor')} 
                onPrev={() => prevTab('guarantor')} 
              />
            </TabsContent>
            
            <TabsContent value="declaration">
              <DeclarationForm 
                data={formData} 
                updateData={(data) => updateFormData('declaration', data)} 
                onPrev={() => prevTab('declaration')} 
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 