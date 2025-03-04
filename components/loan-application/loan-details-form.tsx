import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Loan types
const LOAN_TYPES = [
  { id: "working_capital", name: "Working Capital" },
  { id: "equipment_purchase", name: "Equipment Purchase" },
  { id: "farm_expansion", name: "Farm Expansion" },
  { id: "seed_fertilizer", name: "Seeds & Fertilizer" },
  { id: "irrigation_system", name: "Irrigation System" },
  { id: "storage_facility", name: "Storage Facility" }
];

// Repayment periods
const REPAYMENT_PERIODS = [
  { id: "3_months", name: "3 Months" },
  { id: "6_months", name: "6 Months" },
  { id: "9_months", name: "9 Months" },
  { id: "12_months", name: "12 Months" },
  { id: "18_months", name: "18 Months" },
  { id: "24_months", name: "24 Months" }
];

interface LoanDetailsFormProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function LoanDetailsForm({ data, updateData, onNext, onPrev }: LoanDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.loanType) {
      newErrors.loanType = "Please select a loan type";
    }
    
    if (!data.amount || parseFloat(data.amount) < 5000 || parseFloat(data.amount) > 500000) {
      newErrors.amount = "Loan amount must be between ₦5,000 and ₦500,000";
    }
    
    if (!data.purpose || data.purpose.length < 10) {
      newErrors.purpose = "Please provide a detailed purpose for the loan";
    }
    
    if (!data.repaymentPeriod) {
      newErrors.repaymentPeriod = "Please select a repayment period";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Loan Details</h2>
      
      <div className="space-y-2">
        <Label htmlFor="loanType">Loan Type*</Label>
        <Select 
          value={data.loanType} 
          onValueChange={(value) => handleSelectChange('loanType', value)}
        >
          <SelectTrigger id="loanType">
            <SelectValue placeholder="Select loan type" />
          </SelectTrigger>
          <SelectContent>
            {LOAN_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.loanType && <p className="text-sm text-red-500">{errors.loanType}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Loan Amount (₦)*</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          value={data.amount}
          onChange={handleChange}
          placeholder="50000"
          min="5000"
          max="500000"
        />
        <p className="text-xs text-gray-500">Amount must be between ₦5,000 and ₦500,000</p>
        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="purpose">Loan Purpose*</Label>
        <Textarea
          id="purpose"
          name="purpose"
          value={data.purpose}
          onChange={handleChange}
          placeholder="Describe how you plan to use the loan"
          rows={4}
        />
        {errors.purpose && <p className="text-sm text-red-500">{errors.purpose}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="repaymentPeriod">Repayment Period*</Label>
        <Select 
          value={data.repaymentPeriod} 
          onValueChange={(value) => handleSelectChange('repaymentPeriod', value)}
        >
          <SelectTrigger id="repaymentPeriod">
            <SelectValue placeholder="Select repayment period" />
          </SelectTrigger>
          <SelectContent>
            {REPAYMENT_PERIODS.map(period => (
              <SelectItem key={period.id} value={period.id}>{period.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.repaymentPeriod && <p className="text-sm text-red-500">{errors.repaymentPeriod}</p>}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 