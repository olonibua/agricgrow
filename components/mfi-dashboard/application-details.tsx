import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LoanApplication {
  $id: string;
  status: string;
  fullName: string;
  farmerId: string;
  phone: string;
  email: string;
  address: string;
  lga: string;
  state: string;
  amount: number;
  loanType?: string;
  purpose: string;
  repaymentPeriod?: string;
  applicationDate?: string;
  createdAt: string;
  farmingType: string;
  cropType: string;
  farmSize: number;
  farmLocation: string;
  hasIrrigation: boolean;
  expectedHarvestDate: string;
  estimatedYield: number;
  estimatedRevenue: number;
  marketStrategy: string;
  riskScore: number;
  riskExplanation?: string;
}

interface ApplicationDetailsProps {
  application: LoanApplication;
  onApprove: (application: LoanApplication) => void;
  onReject: (application: LoanApplication) => void;
  onClose: () => void;
}

export default function ApplicationDetails({ 
  application, 
  onApprove, 
  onReject, 
  onClose 
}: ApplicationDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>ID: {application.$id}</CardDescription>
          </div>
          <Badge variant={
            application.status === 'approved' ? "default" : 
            application.status === 'pending' ? "outline" : "destructive"
          }>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Farmer Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{application.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Farmer ID</p>
              <p className="font-medium">{application.farmerId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{application.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{application.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{application.address}, {application.lga}, {application.state}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Loan Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">{formatCurrency(application.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Loan Type</p>
              <p className="font-medium">{application.loanType?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purpose</p>
              <p className="font-medium">{application.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repayment Period</p>
              <p className="font-medium">{application.repaymentPeriod?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Application Date</p>
              <p className="font-medium">{formatDate(application.applicationDate || application.createdAt)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Farm Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Farming Type</p>
              <p className="font-medium">{application.farmingType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Crop Type</p>
              <p className="font-medium">{application.cropType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Farm Size</p>
              <p className="font-medium">{application.farmSize} hectares</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Farm Location</p>
              <p className="font-medium">{application.farmLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Irrigation</p>
              <p className="font-medium">{application.hasIrrigation ? 'Available' : 'Not available'}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Business Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Expected Harvest Date</p>
              <p className="font-medium">{formatDate(application.expectedHarvestDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Yield</p>
              <p className="font-medium">{application.estimatedYield} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Revenue</p>
              <p className="font-medium">{formatCurrency(application.estimatedRevenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Strategy</p>
              <p className="font-medium">{application.marketStrategy}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-sm font-medium">{application.riskScore}%</p>
              </div>
              <Progress 
                value={application.riskScore} 
                className="h-2" 
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Explanation</p>
              <p className="text-sm">{application.riskExplanation}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {application.status === 'pending' && (
          <>
            <Button variant="default" onClick={() => onApprove(application)}>
              Approve Application
            </Button>
            <Button variant="outline" onClick={() => onReject(application)}>
              Reject Application
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
} 