// import { Client, Databases, Query } from 'node-appwrite';
// import { calculateRepaymentSchedule } from '../utils/repayment-calculator';

// // Initialize Appwrite
// const client = new Client()
//   .setEndpoint(process.env.APPWRITE_ENDPOINT)
//   .setProject(process.env.APPWRITE_PROJECT_ID)
//   .setKey(process.env.APPWRITE_API_KEY);

// const databases = new Databases(client);

// export default async function scheduleRepayments(req, res) {
//   try {
//     // Get newly approved loans
//     const loans = await databases.listDocuments(
//       'main',
//       'loans',
//       [
//         Query.equal('status', 'approved'),
//         Query.isNull('repaymentSchedule')
//       ]
//     );
    
//     for (const loan of loans.documents) {
//       // Calculate repayment schedule
//       const schedule = calculateRepaymentSchedule(
//         loan.amount,
//         loan.cropType,
//         new Date(loan.approvalDate)
//       );
      
//       // Update loan with repayment schedule
//       await databases.updateDocument(
//         'main',
//         'loans',
//         loan.$id,
//         {
//           repaymentSchedule: schedule,
//           status: 'active'
//         }
//       );
      
//       // Create repayment records
//       for (const payment of schedule) {
//         await databases.createDocument(
//           'main',
//           'repayments',
//           'unique()',
//           {
//             loanId: loan.$id,
//             amount: payment.amount,
//             dueDate: payment.dueDate,
//             status: 'pending'
//           }
//         );
//       }
      
//       // Send SMS notification to farmer
//       const farmer = await databases.getDocument('main', 'farmers', loan.farmerId);
      
//       // Send notification via Africa's Talking
//       // Implementation would go here
//     }
    
//     return res.json({
//       success: true,
//       processed: loans.documents.length
//     });
//   } catch (error) {
//     console.error('Error scheduling repayments:', error);
//     return res.json({
//       success: false,
//       error: error.message
//     }, 500);
//   }
// } 