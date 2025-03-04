interface RepaymentSchedule {
  dueDate: Date;
  amount: number;
  description: string;
}

// Crop harvest cycle data (simplified)
const cropCycles: Record<string, { durationMonths: number, paymentPoints: number[] }> = {
  'Maize': { durationMonths: 4, paymentPoints: [50, 100] }, // 50% at month 3, 50% at month 4
  'Rice': { durationMonths: 6, paymentPoints: [30, 70, 100] }, // 30% at month 4, 40% at month 5, 30% at month 6
  'Cassava': { durationMonths: 12, paymentPoints: [25, 50, 75, 100] }, // Quarterly payments
  'Yam': { durationMonths: 9, paymentPoints: [50, 100] }, // 50% at month 6, 50% at month 9
  'Other': { durationMonths: 6, paymentPoints: [50, 100] } // Default schedule
};

export function calculateRepaymentSchedule(
  loanAmount: number,
  cropType: string,
  startDate: Date
): RepaymentSchedule[] {
  const cycle = cropCycles[cropType] || cropCycles['Other'];
  const schedule: RepaymentSchedule[] = [];
  
  let previousPercentage = 0;
  
  for (let i = 0; i < cycle.paymentPoints.length; i++) {
    const currentPercentage = cycle.paymentPoints[i];
    const percentageDue = currentPercentage - previousPercentage;
    const amountDue = (loanAmount * percentageDue) / 100;
    
    // Calculate months based on the cycle duration and payment points
    const monthIndex = Math.floor((cycle.durationMonths * currentPercentage) / 100);
    
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + monthIndex);
    
    schedule.push({
      dueDate,
      amount: amountDue,
      description: `Payment ${i + 1} of ${cycle.paymentPoints.length}`
    });
    
    previousPercentage = currentPercentage;
  }
  
  return schedule;
} 