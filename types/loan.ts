export interface BaseApplication {
  $id: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  createdAt: string;
  applicationDate?: string;
}

export interface LoanApplication extends BaseApplication {
  farmerId?: string;
  fullName?: string;
  amount: number;
  cropType?: string;
  farmSize?: number;
  purpose?: string;
  riskScore: number;
  riskExplanation?: string;
  phone: string;
  email: string;
  address: string;
  lga: string;
  state: string;
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
  hasCollateral: boolean;
  hasPreviousLoan: boolean;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined | Date;
}

export interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  description: string;
} 