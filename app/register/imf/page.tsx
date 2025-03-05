'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// States in Nigeria
const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
  "Yobe", "Zamfara"
];

export default function IMFRegistrationPage() {
  const { registerIMF } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const [formData, setFormData] = useState({
    institutionName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    state: '',
    registrationNumber: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    agreeToTerms: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.institutionName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register the IMF in Appwrite Auth with additional data
      await registerIMF(
        formData.email, 
        formData.password, 
        formData.institutionName,
        {
          phone: formData.phone,
          address: formData.address,
          state: formData.state,
          registrationNumber: formData.registrationNumber,
          contactPersonName: formData.contactPersonName,
          contactPersonEmail: formData.contactPersonEmail,
          contactPersonPhone: formData.contactPersonPhone
        }
      );
      
      // The auth context will handle the redirect to the dashboard
      router.push('/imf-dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check if it's a network error and we should retry
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('network') ||
          error.message?.includes('ERR_')) {
        
        if (retryCount < 3) {
          setError(`Network error. Retrying... (${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          
          // Wait and retry
          setTimeout(() => {
            handleSubmit(e);
          }, 2000);
          return;
        }
      }
      
      setError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>MFI Partner Registration</CardTitle>
          <CardDescription>Register your microfinance institution as a partner</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant={error.includes('Retrying') ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{error.includes('Retrying') ? 'Please wait' : 'Error'}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input
                id="institutionName"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleSelectChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number *</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Contact Person Name *</Label>
              <Input
                id="contactPersonName"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPersonEmail">Contact Person Email *</Label>
              <Input
                id="contactPersonEmail"
                name="contactPersonEmail"
                type="email"
                value={formData.contactPersonEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPersonPhone">Contact Person Phone *</Label>
              <Input
                id="contactPersonPhone"
                name="contactPersonPhone"
                value={formData.contactPersonPhone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                }
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {retryCount > 0 ? `Retrying (${retryCount}/3)...` : 'Registering...'}
                </>
              ) : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 