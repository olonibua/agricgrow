import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateLoanRiskExplanation } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add these utility functions at the top of the file
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
  // Normalize the score if needed (some parts of the code use 0-100 scale)
  const normalizedScore = typeof score === 'number' ? score : 0;
  
  if (normalizedScore <= 20) return "Very Low Risk";
  if (normalizedScore <= 40) return "Low Risk";
  if (normalizedScore <= 60) return "Moderate Risk";
  if (normalizedScore <= 80) return "High Risk";
  return "Very High Risk";
};

const getRiskLevelPrefix = (score: number): string => {
  const normalizedScore = typeof score === 'number' ? score : 0;
  
  if (normalizedScore <= 20) return "Very low";
  if (normalizedScore <= 40) return "Low";
  if (normalizedScore <= 60) return "Moderate";
  if (normalizedScore <= 80) return "High";
  return "Very high";
};

const getMonthsFromRepaymentPeriod = (repaymentPeriod?: string): number => {
  if (!repaymentPeriod) return 6; // Default to 6 months
  
  // Extract the number from strings like "3_months", "6_months", etc.
  const match = repaymentPeriod.match(/^(\d+)_/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return 6; // Default fallback
};

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
  hasCollateral: boolean;
  hasPreviousLoan: boolean;
  approvalReason?: string;
  rejectionReason?: string;
  approvalDate?: string;
  rejectionDate?: string;
  repaymentPeriodMonths?: number;
  interestRate?: number;
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  //@it-ignore
  const [currentApplication, setCurrentApplication] = useState(application);
  
  // Use the utility function to get the initial value from the string-based repaymentPeriod
  const initialRepaymentMonths = application.repaymentPeriodMonths || 
                                getMonthsFromRepaymentPeriod(application.repaymentPeriod);
  
  const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState(initialRepaymentMonths);
  const [interestRate, setInterestRate] = useState(application.interestRate || 10);
  
  const handleApprove = () => {
    const updatedApplication = {
      ...application,
      repaymentPeriodMonths: repaymentPeriodMonths,
      interestRate: interestRate
    };
    
    onApprove(updatedApplication);
  };

    useEffect(() => {
      setCurrentApplication(application);
    }, [application]);

    useEffect(() => {
      const checkRiskExplanationConsistency = async () => {
        if (!currentApplication.riskExplanation) return;

        const expectedRiskLevel = getRiskLevelPrefix(
          currentApplication.riskScore
        );
        const currentExplanation =
          currentApplication.riskExplanation.toLowerCase();

        // If explanation doesn't start with the expected risk level
        if (!currentExplanation.startsWith(expectedRiskLevel.toLowerCase())) {
          console.log(
            "Risk explanation inconsistent with score. Auto-refreshing..."
          );
          await refreshRiskAnalysis();
        }
      };

      checkRiskExplanationConsistency();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentApplication]);

    const refreshRiskAnalysis = async () => {
      try {
        setIsRefreshing(true);
        const updatedApplication = await updateLoanRiskExplanation(
          currentApplication.$id,
          currentApplication.riskScore,
          {
            hasCollateral: currentApplication.hasCollateral,
            hasPreviousLoan: currentApplication.hasPreviousLoan,
            hasIrrigation: currentApplication.hasIrrigation,
            cropType: currentApplication.cropType,
          }
        );
        setCurrentApplication({
          ...currentApplication,
          riskExplanation: updatedApplication.riskExplanation,
        });
        setIsRefreshing(false);
      } catch (error) {
        console.error("Error updating risk explanation:", error);
        setIsRefreshing(false);
      }
    };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>ID: {application.$id}</CardDescription>
          </div>
          <Badge
            variant={
              currentApplication.status === "approved"
                ? "default"
                : currentApplication.status === "pending"
                ? "outline"
                : "destructive"
            }
          >
            {currentApplication.status}
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
              <p className="font-medium">
                {application.address}, {application.lga}, {application.state}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Loan Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">
                {formatCurrency(application.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Loan Type</p>
              <p className="font-medium">
                {application.loanType?.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Purpose</p>
              <p className="font-medium">{application.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repayment Period</p>
              <p className="font-medium">
                {application.repaymentPeriod?.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Application Date</p>
              <p className="font-medium">
                {formatDate(
                  application.applicationDate || application.createdAt
                )}
              </p>
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
              <p className="font-medium">
                {application.hasIrrigation ? "Available" : "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Business Plan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Expected Harvest Date
              </p>
              <p className="font-medium">
                {formatDate(application.expectedHarvestDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Yield</p>
              <p className="font-medium">{application.estimatedYield} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Revenue</p>
              <p className="font-medium">
                {formatCurrency(application.estimatedRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Strategy</p>
              <p className="font-medium">{application.marketStrategy}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Risk Score</p>
              <p className="text-2xl font-bold">
                {normalizeRiskScore(application.riskScore)}%
              </p>
              <Progress
                value={normalizeRiskScore(application.riskScore)}
                className="h-2 mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {getRiskCategory(application.riskScore)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Risk Explanation</p>
              {application.riskExplanation ? (
                <p className="text-sm">{application.riskExplanation}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No risk explanation available
                </p>
              )}
            </div>
          </div>
        </div>

        {currentApplication.status === "pending" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="text-lg font-semibold mb-2">Loan Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repaymentPeriod">Repayment Period (Months)</Label>
                {application.repaymentPeriod && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Farmer requested:</strong> {application.repaymentPeriod.replace('_', ' ')}
                  </p>
                )}
                <Select 
                  value={repaymentPeriodMonths.toString()} 
                  onValueChange={(value) => setRepaymentPeriodMonths(parseInt(value))}
                >
                  <SelectTrigger id="repaymentPeriod">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="9">9 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="18">18 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Align with harvest cycle: {formatDate(application.expectedHarvestDate)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  min={1}
                  max={30}
                  step={0.5}
                />
              </div>
            </div>
          </div>
        )}

        {currentApplication.status === "approved" && (
          <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
            <h4 className="font-medium text-green-800">Approval Reason</h4>
            <p className="text-sm text-green-700">
              {currentApplication.approvalReason || "Application has been approved."}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Approved on: {new Date(currentApplication.approvalDate || "").toLocaleDateString()}
            </p>
          </div>
        )}

        {currentApplication.status === "rejected" && (
          <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
            <h4 className="font-medium text-red-800">Rejection Reason</h4>
            <p className="text-sm text-red-700">
              {currentApplication.rejectionReason || "Application has been rejected."}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Rejected on: {new Date(currentApplication.rejectionDate || "").toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRiskAnalysis}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Risk Analysis"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {application.status === "pending" && (
          <>
            <Button variant="default" onClick={handleApprove}>
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