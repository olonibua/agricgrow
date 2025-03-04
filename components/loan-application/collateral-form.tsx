import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CollateralFormProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function CollateralForm({ data, updateData, onNext, onPrev }: CollateralFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    updateData({ [name]: checked });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (data.hasCollateral) {
      if (!data.collateralType) {
        newErrors.collateralType = "Please select a collateral type";
      }
      
      if (!data.collateralValue || parseFloat(data.collateralValue) <= 0) {
        newErrors.collateralValue = "Please enter a valid collateral value";
      }
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
      <h2 className="text-xl font-semibold">Collateral Information</h2>
      
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="hasCollateral"
          checked={data.hasCollateral}
          onCheckedChange={(checked) => handleCheckboxChange('hasCollateral', checked as boolean)}
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="hasCollateral">Collateral</Label>
          <p className="text-sm text-gray-500">
            Do you have collateral to secure this loan?
          </p>
        </div>
      </div>
      
      {data.hasCollateral && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collateralType">Collateral Type*</Label>
            <Select 
              value={data.collateralType} 
              onValueChange={(value) => handleSelectChange('collateralType', value)}
            >
              <SelectTrigger id="collateralType">
                <SelectValue placeholder="Select collateral type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="equipment">Farm Equipment</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.collateralType && <p className="text-sm text-red-500">{errors.collateralType}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="collateralValue">Estimated Value (₦)*</Label>
            <Input
              id="collateralValue"
              name="collateralValue"
              type="number"
              value={data.collateralValue}
              onChange={handleChange}
              placeholder="1000000"
            />
            <p className="text-xs text-gray-500">Enter amount in Naira</p>
            {errors.collateralValue && <p className="text-sm text-red-500">{errors.collateralValue}</p>}
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 