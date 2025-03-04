import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoApproveThreshold: "80",
    autoRejectThreshold: "30",
    organizationName: "AgriGrow Finance",
    adminEmail: "admin@agrigrow.com"
  });

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to a database or API
    localStorage.setItem('mfiSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MFI Dashboard Settings</CardTitle>
          <CardDescription>Manage your preferences and organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input 
                  id="organizationName" 
                  value={settings.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Dashboard Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about new applications</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => handleChange('notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive email alerts for high-priority items</p>
                </div>
                <Switch 
                  id="emailAlerts" 
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked: boolean) => handleChange('emailAlerts', checked)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Loan Processing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autoApproveThreshold">
                  Auto-Approve Threshold (Risk Score %)
                </Label>
                <Input 
                  id="autoApproveThreshold" 
                  type="number"
                  min="0"
                  max="100"
                  value={settings.autoApproveThreshold}
                  onChange={(e) => handleChange('autoApproveThreshold', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Applications with risk scores above this threshold will be recommended for approval
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoRejectThreshold">
                  Auto-Reject Threshold (Risk Score %)
                </Label>
                <Input 
                  id="autoRejectThreshold" 
                  type="number"
                  min="0"
                  max="100"
                  value={settings.autoRejectThreshold}
                  onChange={(e) => handleChange('autoRejectThreshold', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Applications with risk scores below this threshold will be recommended for rejection
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}