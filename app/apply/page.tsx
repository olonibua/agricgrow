'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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


export default function LoanApplicationPage() {
  const router = useRouter();
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
  
  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('loanApplicationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        
        // If there's saved data, check if we can resume from a specific tab
        const savedTab = localStorage.getItem('loanApplicationActiveTab');
        if (savedTab) {
          setActiveTab(savedTab);
        }
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
  }, []);
  
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
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Calculate risk score based on farm details and loan amount
      const farmSize = parseFloat(formData.farmSize);
      const loanAmount = parseFloat(formData.amount);
      const hasIrrigation = formData.hasIrrigation;
      const hasCollateral = formData.hasCollateral;
      
      // Simple risk calculation (would be more sophisticated in production)
      let riskScore = 50; // Base score
      
      // Adjust based on farm size to loan amount ratio
      const amountPerHectare = loanAmount / farmSize;
      if (amountPerHectare < 50000) riskScore += 10;
      else if (amountPerHectare > 200000) riskScore -= 10;
      
      // Adjust for irrigation (reduces risk)
      if (hasIrrigation) riskScore += 15;
      
      // Adjust for collateral (reduces risk)
      if (hasCollateral) riskScore += 20;
      
      // Cap the score between 0-100
      riskScore = Math.max(0, Math.min(100, riskScore));
      
      // For now, instead of creating in Appwrite, store in localStorage
      const applicationId = `LOAN-${Date.now()}`;
      const loanApplication = {
        $id: applicationId,
        farmerId: formData.farmerId,
        amount: parseFloat(formData.amount),
        cropType: formData.cropType,
        farmSize: parseFloat(formData.farmSize),
        purpose: formData.purpose,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        riskScore: riskScore,
        riskExplanation: generateRiskExplanation(riskScore, formData),
        hasIrrigation: formData.hasIrrigation,
        expectedHarvestDate: formData.expectedHarvestDate,
        estimatedYield: formData.estimatedYield,
        estimatedRevenue: formData.estimatedRevenue,
        marketStrategy: formData.marketStrategy,
        hasCollateral: formData.hasCollateral,
        collateralType: formData.hasCollateral ? formData.collateralType : null,
        collateralValue: formData.hasCollateral ? parseFloat(formData.collateralValue) : null,
        guarantorName: formData.guarantorName,
        guarantorPhone: formData.guarantorPhone,
        guarantorRelationship: formData.guarantorRelationship,
        hasInsurance: formData.hasInsurance,
        hasPreviousLoan: formData.hasPreviousLoan,
        // Include all form data for completeness
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        lga: formData.lga,
        loanType: formData.loanType,
        repaymentPeriod: formData.repaymentPeriod,
        farmingType: formData.farmingType,
        livestockType: formData.livestockType,
        farmLocation: formData.farmLocation,
        guarantorAddress: formData.guarantorAddress
      };
      
      // Store in localStorage
      const existingApplications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
      existingApplications.push(loanApplication);
      localStorage.setItem('loanApplications', JSON.stringify(existingApplications));
      
      // Store current application for easy access
      localStorage.setItem('currentLoanApplication', JSON.stringify(loanApplication));
      
      // Clear the form data and active tab from localStorage
      localStorage.removeItem('loanApplicationData');
      localStorage.removeItem('loanApplicationActiveTab');
      
      // Simulate email sending (just log it for now)
      console.log('Email would be sent to:', formData.email, {
        subject: 'Loan Application Received',
        html: `
          <h1>Your loan application has been received</h1>
          <p>Dear ${formData.fullName},</p>
          <p>We have received your loan application for ₦${formData.amount} for ${formData.cropType} farming.</p>
          <p>Your application ID is: ${applicationId}</p>
          <p>We will review your application and get back to you shortly.</p>
          <p>Thank you for choosing AgriGrow Finance.</p>
        `
      });
      
      router.push(`/apply/success?id=${applicationId}`);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setError('Failed to submit your application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate risk explanation based on score and form data
  const generateRiskExplanation = (score: number, data: Record<string, unknown>) => {
    let explanation = '';
    
    if (score >= 80) {
      explanation = 'Low risk. The farm size is appropriate for the requested loan amount, and the presence of irrigation systems reduces crop failure risk.';
    } else if (score >= 60) {
      explanation = 'Moderate risk. The loan amount is reasonable for the farm size, but additional risk factors exist.';
    } else if (score >= 40) {
      explanation = 'Moderate to high risk. The loan amount is high relative to farm size, and there are concerns about repayment capacity.';
    } else {
      explanation = 'High risk. The loan amount is very high relative to farm size, and there are significant concerns about repayment capacity.';
    }
    
    // Add specific factors
    const factors = [];
    if (!data.hasIrrigation) factors.push('No irrigation system increases crop failure risk during dry seasons');
    if (!data.hasCollateral) factors.push('No collateral increases financial risk');
    if (data.hasPreviousLoan) factors.push('Existing loan obligations may affect repayment capacity');
    if (!data.hasInsurance) factors.push('No crop insurance increases vulnerability to weather events');
    
    if (factors.length > 0) {
      explanation += ' Risk factors include: ' + factors.join('; ') + '.';
    }
    
    return explanation;
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