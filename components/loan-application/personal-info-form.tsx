import { useState, useEffect } from 'react';
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

interface PersonalInfoFormData {
  fullName?: string;
  email?: string;
  phone?: string;
  farmerId?: string;
  address?: string;
  state?: string;
  lga?: string;
  [key: string]: string | boolean | undefined;
}

interface PersonalInfoFormProps {
  data: PersonalInfoFormData;
  updateData: (data: Partial<PersonalInfoFormData>) => void;
  onNext: () => void;
}

export default function PersonalInfoForm({ data, updateData, onNext }: PersonalInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Determine which fields were collected during registration
  const [registeredFields, setRegisteredFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    farmerId: true, // Always treat farmerId as registered
    address: false,
    state: false,
    lga: false
  });
  
  // Check which fields are pre-filled from registration
  useEffect(() => {
    console.log("PersonalInfoForm received data:", data);
    console.log("Registered fields determined:", {
      fullName: !!data.fullName,
      email: !!data.email,
      phone: !!data.phone,
      farmerId: true,
      address: !!data.address,
      state: !!data.state,
      lga: !!data.lga
    });
    setRegisteredFields({
      fullName: !!data.fullName,
      email: !!data.email,
      phone: !!data.phone,
      farmerId: true, // Always treat farmerId as registered
      address: !!data.address,
      state: !!data.state,
      lga: !!data.lga
    });
  }, [data]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate fields that aren't pre-filled from registration
    if (!registeredFields.fullName && (!data.fullName || data.fullName.length < 3)) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }
    
    if (!registeredFields.email && (!data.email || !/^\S+@\S+\.\S+$/.test(data.email))) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!registeredFields.phone && (!data.phone || data.phone.length < 11)) {
      newErrors.phone = "Phone number must be at least 11 digits";
    }
    
    // FarmerId is always pre-filled, so we can skip validation
    
    if (!registeredFields.address && (!data.address || data.address.length < 10)) {
      newErrors.address = "Address must be at least 10 characters";
    }
    
    if (!registeredFields.state && !data.state) {
      newErrors.state = "Please select a state";
    }
    
    if (!registeredFields.lga && (!data.lga || data.lga.length < 2)) {
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
            disabled={registeredFields.fullName}
            className={registeredFields.fullName ? "bg-gray-50" : ""}
          />
          {registeredFields.fullName && (
            <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
          )}
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
            disabled={true}
            className="bg-gray-50"
          />
          <p className="text-xs text-muted-foreground">Auto-generated from your profile</p>
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
            disabled={registeredFields.email}
            className={registeredFields.email ? "bg-gray-50" : ""}
          />
          {registeredFields.email && (
            <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
          )}
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
            disabled={registeredFields.phone}
            className={registeredFields.phone ? "bg-gray-50" : ""}
          />
          {registeredFields.phone && (
            <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
          )}
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
          disabled={registeredFields.address}
          className={registeredFields.address ? "bg-gray-50" : ""}
        />
        {registeredFields.address && (
          <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
        )}
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State*</Label>
          <Select 
            value={data.state} 
            onValueChange={(value) => handleSelectChange('state', value)}
            disabled={registeredFields.state}
          >
            <SelectTrigger id="state" className={registeredFields.state ? "bg-gray-50" : ""}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {registeredFields.state && (
            <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
          )}
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
            disabled={registeredFields.lga}
            className={registeredFields.lga ? "bg-gray-50" : ""}
          />
          {registeredFields.lga && (
            <p className="text-xs text-muted-foreground">Pre-filled from your profile</p>
          )}
          {errors.lga && <p className="text-sm text-red-500">{errors.lga}</p>}
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
} 