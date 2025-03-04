import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// States in Nigeria
const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
  "Yobe", "Zamfara"
];

interface PersonalInfoFormProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function PersonalInfoForm({ data, updateData, onNext }: PersonalInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.fullName || data.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }
    
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!data.phone || data.phone.length < 11) {
      newErrors.phone = "Phone number must be at least 11 digits";
    }
    
    if (!data.farmerId || data.farmerId.length < 3) {
      newErrors.farmerId = "Farmer ID must be at least 3 characters";
    }
    
    if (!data.address || data.address.length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }
    
    if (!data.state) {
      newErrors.state = "Please select a state";
    }
    
    if (!data.lga || data.lga.length < 2) {
      newErrors.lga = "LGA must be at least 2 characters";
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
      <h2 className="text-xl font-semibold">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name*</Label>
          <Input
            id="fullName"
            name="fullName"
            value={data.fullName}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="farmerId">Farmer ID*</Label>
          <Input
            id="farmerId"
            name="farmerId"
            value={data.farmerId}
            onChange={handleChange}
            placeholder="FRM12345"
          />
          {errors.farmerId && <p className="text-sm text-red-500">{errors.farmerId}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address*</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            placeholder="john.doe@example.com"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number*</Label>
          <Input
            id="phone"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="08012345678"
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address*</Label>
        <Input
          id="address"
          name="address"
          value={data.address}
          onChange={handleChange}
          placeholder="123 Main Street"
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State*</Label>
          <Select 
            value={data.state} 
            onValueChange={(value) => handleSelectChange('state', value)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lga">Local Government Area*</Label>
          <Input
            id="lga"
            name="lga"
            value={data.lga}
            onChange={handleChange}
            placeholder="Ikeja"
          />
          {errors.lga && <p className="text-sm text-red-500">{errors.lga}</p>}
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 