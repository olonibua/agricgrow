import { EconomicData, Insights, PriceData } from './agricultural';

// Base interfaces
interface BaseApplication {
  $id: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  createdAt: string;
  applicationDate?: string;
}

// Farmer related types
export interface FarmerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  lga: string;
  registrationDate: string;
  farmSize: number;
  primaryCrop: string;
  secondaryCrop: string;
  hasIrrigation: boolean;
  creditScore: number;
}

// Loan related types
export interface LoanApplication extends BaseApplication {
  farmerId: string;
  fullName: string;
  amount: number;
  cropType: string;
  farmSize: number;
  riskScore: number;
  riskExplanation?: string;
  phone: string;
  email: string;
  address: string;
  lga: string;
  state: string;
  purpose: string;
  farmingType: string;
  farmLocation: string;
  hasIrrigation: boolean;
  expectedHarvestDate: string;
  estimatedYield: number;
  estimatedRevenue: number;
  marketStrategy: string;
  loanType?: string;
  repaymentPeriod?: string;
  approvalDate?: string;
  rejectionDate?: string;
  disbursementDate?: string;
  repaymentDate?: string;
  interestRate?: number;
}

// Form Data types
export interface LoanDetailsFormData {
  loanType?: string;
  amount?: string;
  purpose?: string;
  repaymentPeriod?: string;
  [key: string]: string | boolean | undefined;
}

export interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  description: string;
}

// Analysis related types
export interface AnalysisResult {
  viable?: boolean;
  message?: string;
  recommendations?: string[];
  plantingMonths?: string;
  harvestMonths?: string;
  durationDays?: number;
  needsIrrigation?: string;
  harvestDateMessage?: string;
}

// Agricultural Data types
export interface AgriculturalData {
  landUse: Array<{date: string; value: number}>;
  cropProduction: Array<{date: string; value: number}>;
  valueAdded: Array<{date: string; value: number}>;
}

export interface CropData {
  weather: {
    source: string;
    data: WeatherData | null;
  };
  prices: {
    source: string;
    data: PriceData[];
  };
  economic: {
    source: string;
    data: EconomicData;
  };
  agricultural: {
    source: string;
    data: AgriculturalData;
  };
  historicalWeather: Array<{date: string; temperature: number; rainfall: number}>;
  insights: Insights;
}

// Farmer types
export interface Farmer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  farmSize: number; // in hectares
  cropTypes: string[];
  registrationDate: Date;
  ussdPin: string; // For USSD authentication
}

// Loan types
export interface Loan {
  id: string;
  farmerId: string;
  amount: number;
  purpose: string;
  cropType: string;
  farmSize: number;
  applicationDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  riskScore: number; // 0-100, calculated by AI
  riskExplanation?: string;
  approvedBy?: string; // IMF Partner admin ID
  approvalDate?: Date;
  repaymentSchedule?: RepaymentSchedule[];
}

// Repayment types
export interface Repayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'ussd' | 'bank' | 'mobile_money';
  transactionReference?: string;
}

// IMF Partner types
export interface IMF {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  activeLoans: number;
  totalLoanAmount: number;
  repaymentRate: number; // Percentage
}

// Weather and crop data types
export interface WeatherData {
  id: string;
  location: string;
  date: Date;
  rainfall: number;
  temperature: number;
  humidity: number;
  forecast: string;
}

export interface CropPrice {
  id: string;
  cropType: string;
  price: number;
  date: Date;
  market: string;
  trend: 'rising' | 'falling' | 'stable';
}

export * from './farmer';
export * from './loan';
export * from './agricultural'; 