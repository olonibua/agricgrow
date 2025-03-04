import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { sendSMS } from '@/lib/africas-talking';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  
  // const sessionId = data.get('sessionId') as string;
  const phoneNumber = data.get('phoneNumber') as string;
  const text = data.get('text') as string;
  
  const textArray = text.split('*');
  const level = textArray.length;
  
  let response = '';
  
  // Main menu option 3: Make repayment
  if (textArray[0] === '3') {
    if (level === 1) {
      response = 'CON Enter your farmer ID:';
    } else if (level === 2) {
      const farmerId = textArray[1];
      
      try {
        // Get active loans for the farmer
        const loans = await databases.listDocuments(
          'main',
          'loans',
          [
            Query.equal('farmerId', farmerId),
            Query.equal('status', 'active')
          ]
        );
        
        if (loans.total === 0) {
          response = 'END You have no active loans.';
        } else {
          response = 'CON Select a loan to repay:\n';
          
          loans.documents.forEach((loan, index) => {
            response += `${index + 1}. Loan #${loan.$id.substring(0, 8)} - ₦${loan.amount}\n`;
          });
        }
      } catch  {
        response = 'END An error occurred. Please try again later.';
      }
    } else if (level === 3) {
      const farmerId = textArray[1];
      const loanIndex = parseInt(textArray[2]) - 1;
      
      try {
        // Get active loans for the farmer
        const loans = await databases.listDocuments(
          'main',
          'loans',
          [
            Query.equal('farmerId', farmerId),
            Query.equal('status', 'active')
          ]
        );
        
        if (loanIndex < 0 || loanIndex >= loans.total) {
          response = 'END Invalid loan selection.';
        } else {
          const selectedLoan = loans.documents[loanIndex];
          
          // Get pending repayments
          const repayments = await databases.listDocuments(
            'main',
            'repayments',
            [
              Query.equal('loanId', selectedLoan.$id),
              Query.equal('status', 'pending'),
              Query.orderAsc('dueDate')
            ]
          );
          
          if (repayments.total === 0) {
            response = 'END No pending repayments for this loan.';
          } else {
            response = 'CON Select a repayment to make:\n';
            
            repayments.documents.forEach((repayment, index) => {
              const dueDate = new Date(repayment.dueDate).toLocaleDateString();
              response += `${index + 1}. ₦${repayment.amount} due on ${dueDate}\n`;
            });
          }
        }
      } catch {
        response = 'END An error occurred. Please try again later.';
      }
    } else if (level === 4) {
      response = 'CON Enter payment method:\n1. Mobile Money\n2. Bank Transfer\n3. Cash';
    } else if (level === 5) {
      response = 'CON Enter transaction reference or receipt number:';
    } else if (level === 6) {
      const farmerId = textArray[1];
      const loanIndex = parseInt(textArray[2]) - 1;
      const repaymentIndex = parseInt(textArray[3]) - 1;
      const paymentMethod = textArray[4];
      const transactionRef = textArray[5];
      
      try {
        // Get the selected loan
        const loans = await databases.listDocuments(
          'main',
          'loans',
          [
            Query.equal('farmerId', farmerId),
            Query.equal('status', 'active')
          ]
        );
        
        const selectedLoan = loans.documents[loanIndex];
        
        // Get the selected repayment
        const repayments = await databases.listDocuments(
          'main',
          'repayments',
          [
            Query.equal('loanId', selectedLoan.$id),
            Query.equal('status', 'pending'),
            Query.orderAsc('dueDate')
          ]
        );
        
        const selectedRepayment = repayments.documents[repaymentIndex];
        
        // Update repayment status
        await databases.updateDocument(
          'main',
          'repayments',
          selectedRepayment.$id,
          {
            status: 'paid',
            paidDate: new Date(),
            paymentMethod: ['mobile_money', 'bank', 'cash'][parseInt(paymentMethod) - 1],
            transactionReference: transactionRef
          }
        );
        
        // Send confirmation SMS
        await sendSMS(
          phoneNumber,
          `Your payment of ₦${selectedRepayment.amount} for Loan #${selectedLoan.$id.substring(0, 8)} has been recorded. Thank you!`
        );
        
        response = 'END Your payment has been recorded successfully. You will receive a confirmation SMS shortly.';
      } catch  {
        response = 'END An error occurred. Please try again later.';
      }
    }
  }
  
  return NextResponse.json({ response });
} 