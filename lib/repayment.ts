import { ID } from 'appwrite';
import { RepaymentSchedule } from '@/types/loan';

/**
 * Generates a repayment schedule for an approved loan
 * @param loanId The ID of the loan
 * @param amount The principal amount of the loan
 * @param interestRate Annual interest rate (e.g., 10 for 10%)
 * @param periodMonths Number of months for repayment
 * @param startDate Date to start the repayment schedule from
 * @returns Array of repayment schedule items
 */
export function generateRepaymentSchedule(
  loanId: string,
  amount: number,
  interestRate: number,
  periodMonths: number,
  startDate: Date = new Date()
): RepaymentSchedule[] {
  // Convert annual interest rate to monthly
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // Calculate monthly payment using the loan amortization formula
  const monthlyPayment = amount * monthlyInterestRate * 
    Math.pow(1 + monthlyInterestRate, periodMonths) / 
    (Math.pow(1 + monthlyInterestRate, periodMonths) - 1);
  
  const schedule: RepaymentSchedule[] = [];
  let remainingPrincipal = amount;
  let currentDate = new Date(startDate);
  
  // Generate payment schedule for each month
  for (let i = 0; i < periodMonths; i++) {
    // Calculate interest for this period
    const interestPayment = remainingPrincipal * monthlyInterestRate;
    
    // Calculate principal for this period
    let principalPayment = monthlyPayment - interestPayment;
    
    // Adjust for final payment rounding
    if (i === periodMonths - 1) {
      principalPayment = remainingPrincipal;
    }
    
    // Update remaining principal
    remainingPrincipal -= principalPayment;
    
    // Set due date (1 month from previous payment)
    currentDate = new Date(currentDate);
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Create payment object
    schedule.push({
      id: ID.unique(),
      loanId: loanId,
      dueDate: currentDate.toISOString(),
      amount: Math.round((principalPayment + interestPayment) * 100) / 100,
      status: 'pending'
    });
  }
  
  return schedule;
}

/**
 * Checks for overdue payments and updates their status
 * @param loans Array of loan applications to check
 * @returns Updated loans with overdue payments marked
 */
export function checkOverduePayments<T extends { repaymentSchedule?: RepaymentSchedule[] }>(loans: T[]): T[] {
  const today = new Date();
  
  return loans.map(loan => {
    if (!loan.repaymentSchedule) return loan;
    
    // Check each payment in the schedule
    const updatedSchedule = loan.repaymentSchedule.map(payment => {
      // If payment is already paid, leave it alone
      if (payment.status === 'paid') return payment;
      
      // Check if payment is overdue
      const dueDate = new Date(payment.dueDate);
      if (dueDate < today && payment.status === 'pending') {
        return {
          ...payment,
          status: 'overdue'
        };
      }
      
      return payment;
    });
    
    // If schedule changed, update the loan
    if (JSON.stringify(updatedSchedule) !== JSON.stringify(loan.repaymentSchedule)) {
      return {
        ...loan,
        repaymentSchedule: updatedSchedule
      };
    }
    
    return loan;
  });
} 