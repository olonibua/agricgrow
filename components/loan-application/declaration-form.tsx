import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface DeclarationFormData {
  hasInsurance?: boolean;
  hasPreviousLoan?: boolean;
  agreeToTerms?: boolean;
  [key: string]: string | boolean | undefined;
}

interface DeclarationFormProps {
  data: DeclarationFormData;
  updateData: (data: Partial<DeclarationFormData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function DeclarationForm({ data, updateData, onPrev, onSubmit, isSubmitting }: DeclarationFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    updateData({ [name]: checked });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Declaration</h2>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            id="hasInsurance"
            checked={data.hasInsurance}
            onCheckedChange={(checked) => handleCheckboxChange('hasInsurance', checked as boolean)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="hasInsurance">Agricultural Insurance</Label>
            <p className="text-sm text-gray-500">
              Do you have agricultural insurance for your farm?
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            id="hasPreviousLoan"
            checked={data.hasPreviousLoan}
            onCheckedChange={(checked) => handleCheckboxChange('hasPreviousLoan', checked as boolean)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="hasPreviousLoan">Previous Loans</Label>
            <p className="text-sm text-gray-500">
              Do you have any outstanding loans?
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            id="agreeToTerms"
            checked={data.agreeToTerms}
            onCheckedChange={(checked) => handleCheckboxChange('agreeToTerms', checked as boolean)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="agreeToTerms">Terms and Conditions*</Label>
            <p className="text-sm text-gray-500">
              I hereby declare that the information provided is true and correct. I understand that any false statement may result in the rejection of my application or legal action.
            </p>
          </div>
        </div>
        {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6">
        <h3 className="font-medium mb-2">Important Information</h3>
        <ul className="text-sm space-y-2 list-disc pl-5">
          <li>Your application will be reviewed within 3-5 business days.</li>
          <li>You may be contacted for additional information or documentation.</li>
          <li>Loan disbursement is subject to approval and verification of all information provided.</li>
          <li>Interest rates range from 5% to 15% depending on the loan type and risk assessment.</li>
          <li>Late repayments may incur additional fees and affect your credit score.</li>
        </ul>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  );
} 