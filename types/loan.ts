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
  interestRate: number;
  hasCollateral: boolean;
  hasPreviousLoan: boolean;
  updatedAt?: string;
  repaymentSchedule?: RepaymentSchedule[];
  repaymentPeriodMonths: number;
  [key: string]: string | number | boolean | Date | undefined | RepaymentSchedule[] | null;
}

export interface RepaymentSchedule {
  id: string;
  loanId: string;
  dueDate: string;
  amount: number;
  status: string;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
} 