import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BusinessPlanFormProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function BusinessPlanForm({ data, updateData, onNext, onPrev }: BusinessPlanFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.expectedHarvestDate) {
      newErrors.expectedHarvestDate = "Please enter expected harvest date";
    }
    
    if (!data.estimatedYield) {
      newErrors.estimatedYield = "Please enter estimated yield";
    }
    
    if (!data.estimatedRevenue) {
      newErrors.estimatedRevenue = "Please enter estimated revenue";
    }
    
    if (!data.marketStrategy || data.marketStrategy.length < 10) {
      newErrors.marketStrategy = "Please describe your market strategy";
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
      <h2 className="text-xl font-semibold">Business Plan</h2>
      
      <div className="space-y-2">
        <Label htmlFor="expectedHarvestDate">Expected Harvest Date*</Label>
        <Input
          id="expectedHarvestDate"
          name="expectedHarvestDate"
          type="date"
          value={data.expectedHarvestDate}
          onChange={handleChange}
        />
        {errors.expectedHarvestDate && <p className="text-sm text-red-500">{errors.expectedHarvestDate}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedYield">Estimated Yield (kg/tons)*</Label>
          <Input
            id="estimatedYield"
            name="estimatedYield"
            value={data.estimatedYield}
            onChange={handleChange}
            placeholder="e.g., 2000 kg"
          />
          {errors.estimatedYield && <p className="text-sm text-red-500">{errors.estimatedYield}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estimatedRevenue">Estimated Revenue (₦)*</Label>
          <Input
            id="estimatedRevenue"
            name="estimatedRevenue"
            type="number"
            value={data.estimatedRevenue}
            onChange={handleChange}
            placeholder="e.g., 500000"
          />
          {errors.estimatedRevenue && <p className="text-sm text-red-500">{errors.estimatedRevenue}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="marketStrategy">Market Strategy*</Label>
        <Textarea
          id="marketStrategy"
          name="marketStrategy"
          value={data.marketStrategy}
          onChange={handleChange}
          placeholder="Describe how you plan to sell your produce and to whom"
          rows={4}
        />
        {errors.marketStrategy && <p className="text-sm text-red-500">{errors.marketStrategy}</p>}
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 