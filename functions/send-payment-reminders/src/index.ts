// import { Client, Databases, Query } from 'node-appwrite';
// import { sendSMS } from '../utils/africas-talking';

// // Initialize Appwrite
// const client = new Client()
//   .setEndpoint(process.env.APPWRITE_ENDPOINT)
//   .setProject(process.env.APPWRITE_PROJECT_ID)
//   .setKey(process.env.APPWRITE_API_KEY);

// const databases = new Databases(client);

// export default async function sendPaymentReminders(req, res) {
//   try {
//     // Get upcoming repayments (due in the next 3 days)
//     const now = new Date();
//     const threeDaysLater = new Date();
//     threeDaysLater.setDate(now.getDate() + 3);
    
//     const repayments = await databases.listDocuments(
//       'main',
//       'repayments',
//       [
//         Query.equal('status', 'pending'),
//         Query.lessThanEqual('dueDate', threeDaysLater.toISOString()),
//         Query.greaterThan('dueDate', now.toISOString())
//       ]
//     );
    
//     const remindersSent = [];
    
//     for (const repayment of repayments.documents) {
//       // Get loan details
//       const loan = await databases.getDocument('main', 'loans', repayment.loanId);
      
//       // Get farmer details
//       const farmer = await databases.getDocument('main', 'farmers', loan.farmerId);
      
//       // Calculate days until due
//       const dueDate = new Date(repayment.dueDate);
//       const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
//       // Prepare message
//       const message = `AgriGrow Finance: Your loan payment of ₦${repayment.amount} is due in ${daysUntilDue} day(s). Dial *123# and select option 3 to make your payment.`;
      
//       // Send SMS
//       await sendSMS(farmer.phone, message);
      
//       remindersSent.push({
//         repaymentId: repayment.$id,
//         farmerId: farmer.$id,
//         phone: farmer.phone,
//         amount: repayment.amount,
//         dueDate: repayment.dueDate
//       });
//     }
    
//     return res.json({
//       success: true,
//       remindersSent
//     });
//   } catch (error) {
//     console.error('Error sending payment reminders:', error);
//     return res.json({
//       success: false,
//       error: error.message
//     }, 500);
//   }
// } 