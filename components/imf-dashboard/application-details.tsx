import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateLoanRiskExplanation } from "@/lib/appwrite";
import { useEffect, useState } from "react";

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

    useEffect(() => {
      const checkRiskExplanationConsistency = async () => {
        if (!application.riskExplanation) return;

        const expectedRiskLevel = getRiskLevelPrefix(application.riskScore);
        const currentExplanation = application.riskExplanation.toLowerCase();

        // If explanation doesn't start with the expected risk level
        if (!currentExplanation.startsWith(expectedRiskLevel.toLowerCase())) {
          console.log(
            "Risk explanation inconsistent with score. Auto-refreshing..."
          );
          await refreshRiskAnalysis();
        }
      };

      checkRiskExplanationConsistency();
    }, [application]);

    const refreshRiskAnalysis = async () => {
      try {
        setIsRefreshing(true);
        const updatedApplication = await updateLoanRiskExplanation(
          application.$id,
          application.riskScore,
          {
            hasCollateral: application.hasCollateral,
            hasPreviousLoan: application.hasPreviousLoan,
            hasIrrigation: application.hasIrrigation,
            cropType: application.cropType,
          }
        );
        setCurrentApplication({
          ...application,
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
              application.status === "approved"
                ? "default"
                : application.status === "pending"
                ? "outline"
                : "destructive"
            }
          >
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