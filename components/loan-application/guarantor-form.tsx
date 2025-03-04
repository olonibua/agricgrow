import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GuarantorFormData {
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorAddress?: string;
  guarantorRelationship?: string;
  [key: string]: string | boolean | undefined;
}

interface GuarantorFormProps {
  data: GuarantorFormData;
  updateData: (data: Partial<GuarantorFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function GuarantorForm({ data, updateData, onNext, onPrev }: GuarantorFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.guarantorName || data.guarantorName.length < 3) {
      newErrors.guarantorName = "Guarantor name must be at least 3 characters";
    }
    
    if (!data.guarantorPhone || data.guarantorPhone.length < 11) {
      newErrors.guarantorPhone = "Guarantor phone must be at least 11 digits";
    }
    
    if (!data.guarantorAddress || data.guarantorAddress.length < 10) {
      newErrors.guarantorAddress = "Guarantor address must be at least 10 characters";
    }
    
    if (!data.guarantorRelationship || data.guarantorRelationship.length < 2) {
      newErrors.guarantorRelationship = "Please enter relationship with guarantor";
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
      <h2 className="text-xl font-semibold">Guarantor Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guarantorName">Guarantor&apos;s Full Name*</Label>
          <Input
            id="guarantorName"
            name="guarantorName"
            value={data.guarantorName}
            onChange={handleChange}
            placeholder="Jane Doe"
          />
          {errors.guarantorName && <p className="text-sm text-red-500">{errors.guarantorName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guarantorPhone">Guarantor&apos;s Phone Number*</Label>
          <Input
            id="guarantorPhone"
            name="guarantorPhone"
            value={data.guarantorPhone}
            onChange={handleChange}
            placeholder="08012345678"
          />
          {errors.guarantorPhone && <p className="text-sm text-red-500">{errors.guarantorPhone}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="guarantorAddress">Guarantor&apos;s Address*</Label>
        <Input
          id="guarantorAddress"
          name="guarantorAddress"
          value={data.guarantorAddress}
          onChange={handleChange}
          placeholder="123 Main Street"
        />
        {errors.guarantorAddress && <p className="text-sm text-red-500">{errors.guarantorAddress}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="guarantorRelationship">Relationship with Guarantor*</Label>
        <Input
          id="guarantorRelationship"
          name="guarantorRelationship"
          value={data.guarantorRelationship}
          onChange={handleChange}
          placeholder="e.g., Family, Friend, Business Partner"
        />
        {errors.guarantorRelationship && <p className="text-sm text-red-500">{errors.guarantorRelationship}</p>}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 