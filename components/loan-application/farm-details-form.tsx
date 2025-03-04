import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Common crops in Nigeria
const CROPS = [
  { id: "maize", name: "Maize" },
  { id: "rice", name: "Rice" },
  { id: "cassava", name: "Cassava" },
  { id: "yam", name: "Yam" },
  { id: "tomato", name: "Tomatoes" },
  { id: "beans", name: "Beans" },
  { id: "groundnut", name: "Groundnut" },
  { id: "sorghum", name: "Sorghum" },
  { id: "other", name: "Other" }
];

// Livestock types
const LIVESTOCK = [
  { id: "poultry", name: "Poultry" },
  { id: "cattle", name: "Cattle" },
  { id: "goats", name: "Goats" },
  { id: "sheep", name: "Sheep" },
  { id: "pigs", name: "Pigs" },
  { id: "fish", name: "Fish" },
  { id: "other", name: "Other" }
];

interface FarmDetailsFormData {
  farmingType?: string;
  cropType?: string;
  livestockType?: string;
  farmSize?: string;
  farmLocation?: string;
  hasIrrigation?: boolean;
  [key: string]: string | boolean | undefined;
}

interface FarmDetailsFormProps {
  data: FarmDetailsFormData;
  updateData: (data: Partial<FarmDetailsFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function FarmDetailsForm({ data, updateData, onNext, onPrev }: FarmDetailsFormProps) {
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
    
    if (!data.farmingType) {
      newErrors.farmingType = "Please select a farming type";
    }
    
    if (data.farmingType === "crop" && !data.cropType) {
      newErrors.cropType = "Please select a crop type";
    }
    
    if (data.farmingType === "livestock" && !data.livestockType) {
      newErrors.livestockType = "Please select a livestock type";
    }
    
    if (!data.farmSize || parseFloat(data.farmSize) <= 0) {
      newErrors.farmSize = "Please enter a valid farm size";
    }
    
    if (!data.farmLocation || data.farmLocation.length < 5) {
      newErrors.farmLocation = "Please enter a valid farm location";
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
      <h2 className="text-xl font-semibold">Farm Details</h2>
      
      <div className="space-y-2">
        <Label>Farming Type*</Label>
        <RadioGroup 
          value={data.farmingType} 
          onValueChange={(value) => handleSelectChange('farmingType', value)}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="crop" id="crop" />
            <Label htmlFor="crop">Crop Farming</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="livestock" id="livestock" />
            <Label htmlFor="livestock">Livestock Farming</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mixed" id="mixed" />
            <Label htmlFor="mixed">Mixed Farming</Label>
          </div>
        </RadioGroup>
        {errors.farmingType && <p className="text-sm text-red-500">{errors.farmingType}</p>}
      </div>
      
      {(data.farmingType === "crop" || data.farmingType === "mixed") && (
        <div className="space-y-2">
          <Label htmlFor="cropType">Crop Type*</Label>
          <Select 
            value={data.cropType} 
            onValueChange={(value) => handleSelectChange('cropType', value)}
          >
            <SelectTrigger id="cropType">
              <SelectValue placeholder="Select crop type" />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map(crop => (
                <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cropType && <p className="text-sm text-red-500">{errors.cropType}</p>}
        </div>
      )}
      
      {(data.farmingType === "livestock" || data.farmingType === "mixed") && (
        <div className="space-y-2">
          <Label htmlFor="livestockType">Livestock Type*</Label>
          <Select 
            value={data.livestockType} 
            onValueChange={(value) => handleSelectChange('livestockType', value)}
          >
            <SelectTrigger id="livestockType">
              <SelectValue placeholder="Select livestock type" />
            </SelectTrigger>
            <SelectContent>
              {LIVESTOCK.map(livestock => (
                <SelectItem key={livestock.id} value={livestock.id}>{livestock.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.livestockType && <p className="text-sm text-red-500">{errors.livestockType}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="farmSize">Farm Size (Hectares)*</Label>
          <Input
            id="farmSize"
            name="farmSize"
            type="number"
            value={data.farmSize}
            onChange={handleChange}
            placeholder="2.5"
            min="0.1"
            step="0.1"
          />
          {errors.farmSize && <p className="text-sm text-red-500">{errors.farmSize}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="farmLocation">Farm Location*</Label>
          <Input
            id="farmLocation"
            name="farmLocation"
            value={data.farmLocation}
            onChange={handleChange}
            placeholder="Village/Town, LGA"
          />
          {errors.farmLocation && <p className="text-sm text-red-500">{errors.farmLocation}</p>}
        </div>
      </div>
      
      <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox
          id="hasIrrigation"
          checked={data.hasIrrigation}
          onCheckedChange={(checked) => handleCheckboxChange('hasIrrigation', checked as boolean)}
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="hasIrrigation">Irrigation System</Label>
          <p className="text-sm text-gray-500">
            Does your farm have an irrigation system?
          </p>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 