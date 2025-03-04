import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

interface LoanApplication {
  status?: string;
  approvalDate?: string;
  repaymentPeriod?: string;
}

export function calculateLoanStatus(application: LoanApplication): string {
  // This is a simplified version - in a real app, you'd have more complex logic
  const { status, approvalDate, repaymentPeriod } = application;
  
  if (status === 'rejected') return 'Rejected';
  if (status === 'pending') return 'Pending Review';
  
  // For approved loans
  if (status === 'approved') {
    const today = new Date();
    const approval = new Date(approvalDate || '');
    
    // Convert repayment period to months
    let months = 3;
    if (repaymentPeriod === '6_months') months = 6;
    if (repaymentPeriod === '9_months') months = 9;
    if (repaymentPeriod === '12_months') months = 12;
    if (repaymentPeriod === '18_months') months = 18;
    if (repaymentPeriod === '24_months') months = 24;
    
    // Calculate due date
    const dueDate = new Date(approval);
    dueDate.setMonth(dueDate.getMonth() + months);
    
    if (today > dueDate) return 'Overdue';
    return 'Active';
  }
  
  return 'Unknown';
}

export function calculateRepaymentProgress(application: LoanApplication): number {
  // This is a simplified version - in a real app, you'd calculate based on actual repayments
  const { status, approvalDate, repaymentPeriod } = application;
  
  if (status !== 'approved') return 0;
  
  // Convert repayment period to months
  let totalMonths = 3;
  if (repaymentPeriod === '6_months') totalMonths = 6;
  if (repaymentPeriod === '9_months') totalMonths = 9;
  if (repaymentPeriod === '12_months') totalMonths = 12;
  if (repaymentPeriod === '18_months') totalMonths = 18;
  if (repaymentPeriod === '24_months') totalMonths = 24;
  
  const today = new Date();
  const approval = new Date(approvalDate || '');
  
  // Calculate months elapsed
  const monthsElapsed = (today.getFullYear() - approval.getFullYear()) * 12 + 
                        (today.getMonth() - approval.getMonth());
  
  // Calculate progress percentage
  const progress = Math.min(100, Math.max(0, (monthsElapsed / totalMonths) * 100));
  
  return Math.round(progress);
}

export function generateApplicationId(): string {
  // Generate a random application ID with format: AGF-YYYY-XXXXX
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `AGF-${year}-${random}`;
}
