import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";

// Crop growing seasons in Nigeria (simplified)
const CROP_SEASONS = {
  rice: { plantingMonths: [4, 5, 6], harvestMonths: [9, 10, 11], durationDays: 120, needsIrrigation: true },
  maize: { plantingMonths: [3, 4, 5], harvestMonths: [7, 8, 9], durationDays: 100, needsIrrigation: false },
  cassava: { plantingMonths: [3, 4, 5], harvestMonths: [9, 10, 11, 12], durationDays: 270, needsIrrigation: false },
  yam: { plantingMonths: [11, 12, 1], harvestMonths: [7, 8, 9], durationDays: 240, needsIrrigation: false },
  tomato: { plantingMonths: [9, 10, 11], harvestMonths: [1, 2, 3], durationDays: 90, needsIrrigation: true },
  beans: { plantingMonths: [6, 7], harvestMonths: [9, 10], durationDays: 90, needsIrrigation: false },
  groundnut: { plantingMonths: [5, 6], harvestMonths: [9, 10], durationDays: 120, needsIrrigation: false },
  sorghum: { plantingMonths: [5, 6], harvestMonths: [9, 10], durationDays: 120, needsIrrigation: false }
};

interface LoanApplication {
  $id: string;
  status: string;
  amount: number;
  cropType?: string;
  riskScore: number;
  hasIrrigation?: boolean;
}

// Add these utility functions for risk score normalization
const normalizeRiskScore = (score: number): number => {
  // If score is outside the 0-100 range, normalize it
  if (score > 100) {
    return 100;
  } else if (score < 0) {
    return 0;
  }
  return score;
};

// Get risk category based on normalized score
const getRiskCategory = (score: number): string => {
  const normalizedScore = normalizeRiskScore(score);
  
  if (normalizedScore <= 20) return "Very Low Risk";
  if (normalizedScore <= 40) return "Low Risk";
  if (normalizedScore <= 60) return "Moderate Risk";
  if (normalizedScore <= 80) return "High Risk";
  return "Very High Risk";
};

interface AnalyticsTabProps {
  applications: LoanApplication[];
}

export default function AnalyticsTab({ applications }: AnalyticsTabProps) {
  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
  
  const totalAmount = applications.reduce((sum, app) => sum + (app.amount || 0), 0);
  const approvedAmount = applications
    .filter(app => app.status === 'approved')
    .reduce((sum, app) => sum + (app.amount || 0), 0);
  
  // Calculate average risk score with normalization
  const avgRiskScore = applications.length > 0 
    ? Math.round(applications.reduce((sum, app) => sum + normalizeRiskScore(app.riskScore || 0), 0) / applications.length) 
    : 0;
  
  // Get risk category for the average score
  const riskCategory = getRiskCategory(avgRiskScore);
  
  // Prepare data for charts
  const statusData = [
    { name: 'Pending', value: pendingApplications, color: '#f59e0b' },
    { name: 'Approved', value: approvedApplications, color: '#10b981' },
    { name: 'Rejected', value: rejectedApplications, color: '#ef4444' }
  ];
  
  // Crop distribution data
  const cropCounts: Record<string, number> = {};
  applications.forEach(app => {
    if (app.cropType) {
      cropCounts[app.cropType] = (cropCounts[app.cropType] || 0) + 1;
    }
  });
  
  const cropData = Object.entries(cropCounts).map(([name, value]) => ({ name, value }));
  
  // Amount by crop type
  const cropAmounts: Record<string, number> = {};
  applications.forEach(app => {
    if (app.cropType && app.amount) {
      cropAmounts[app.cropType] = (cropAmounts[app.cropType] || 0) + app.amount;
    }
  });
  
  const cropAmountData = Object.entries(cropAmounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Risk distribution
  const riskCategories = {
    low: applications.filter(app => app.riskScore >= 70).length,
    medium: applications.filter(app => app.riskScore >= 40 && app.riskScore < 70).length,
    high: applications.filter(app => app.riskScore < 40).length
  };
  
  const riskData = [
    { name: 'Low Risk', value: riskCategories.low, color: '#10b981' },
    { name: 'Medium Risk', value: riskCategories.medium, color: '#f59e0b' },
    { name: 'High Risk', value: riskCategories.high, color: '#ef4444' }
  ];

  // Update the risk badge variant logic
  const getRiskBadgeVariant = (score: number) => {
    const normalizedScore = normalizeRiskScore(score);
    if (normalizedScore <= 40) return "default"; // Low risk
    if (normalizedScore <= 70) return "outline"; // Medium risk
    return "destructive"; // High risk
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-sm text-muted-foreground">Total Requested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(approvedAmount)}</div>
            <p className="text-sm text-muted-foreground">Total Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{avgRiskScore}%</div>
              <Badge className="ml-2" variant={getRiskBadgeVariant(avgRiskScore)}>
                {riskCategory}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Average Risk Score</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="crops">Crop Analysis</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>Breakdown of loan applications by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="crops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop Distribution</CardTitle>
              <CardDescription>Number of applications by crop type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cropData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Loan Amount by Crop Type</CardTitle>
              <CardDescription>Total requested amount by crop type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cropAmountData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Applications by risk category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Low Risk', 
                          value: applications.filter(app => normalizeRiskScore(app.riskScore) <= 40).length, 
                          color: '#10b981' 
                        },
                        { 
                          name: 'Medium Risk', 
                          value: applications.filter(app => normalizeRiskScore(app.riskScore) > 40 && normalizeRiskScore(app.riskScore) <= 70).length, 
                          color: '#f59e0b' 
                        },
                        { 
                          name: 'High Risk', 
                          value: applications.filter(app => normalizeRiskScore(app.riskScore) > 70).length, 
                          color: '#ef4444' 
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Risk Factors Analysis</CardTitle>
              <CardDescription>Common risk factors in loan applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Irrigation Availability</p>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm">Applications requiring irrigation</p>
                  <p className="text-sm font-medium">
                    {applications.filter(app => 
                      app.cropType && CROP_SEASONS[app.cropType as keyof typeof CROP_SEASONS]?.needsIrrigation
                    ).length}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm">Applications with irrigation available</p>
                  <p className="text-sm font-medium">
                    {applications.filter(app => app.hasIrrigation).length}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-destructive">Irrigation risk factor</p>
                  <p className="text-sm font-medium text-destructive">
                    {applications.filter(app => 
                      app.cropType && 
                      CROP_SEASONS[app.cropType as keyof typeof CROP_SEASONS]?.needsIrrigation && 
                      !app.hasIrrigation
                    ).length}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Seasonal Alignment</p>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm">Applications with good planting timing</p>
                  <p className="text-sm font-medium">
                    {applications.filter(app => {
                      if (!app.cropType) return false;
                      const cropInfo = CROP_SEASONS[app.cropType as keyof typeof CROP_SEASONS];
                      if (!cropInfo) return false;
                      const currentMonth = new Date().getMonth() + 1;
                      return cropInfo.plantingMonths.includes(currentMonth);
                    }).length}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-destructive">Seasonal misalignment risk</p>
                  <p className="text-sm font-medium text-destructive">
                    {applications.filter(app => {
                      if (!app.cropType) return false;
                      const cropInfo = CROP_SEASONS[app.cropType as keyof typeof CROP_SEASONS];
                      if (!cropInfo) return false;
                      const currentMonth = new Date().getMonth() + 1;
                      return !cropInfo.plantingMonths.includes(currentMonth);
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 