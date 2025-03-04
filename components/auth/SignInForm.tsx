"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SignInFormProps {
  onSuccess: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Here we would integrate with Appwrite auth
      // For now, we'll simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Redirect based on user type (would be determined by Appwrite user data)
      const userType = formData.email.includes("mfi") ? "mfi" : "farmer";
      
      onSuccess();
      
      if (userType === "mfi") {
        router.push("/dashboard");
      } else {
        router.push("/farmer-dashboard");
      }
    } catch  {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2 ">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button variant="link" className="p-0 h-auto text-sm" type="button">
            Forgot password?
          </Button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={formData.rememberMe}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
      </div>
      
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
} 