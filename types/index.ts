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
  approvedBy?: string; // MFI admin ID
  approvalDate?: Date;
  repaymentSchedule?: RepaymentSchedule[];
}

// Repayment types
export interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  description: string;
}

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

// MFI types
export interface MFI {
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