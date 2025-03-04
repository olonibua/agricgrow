import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate, calculateLoanStatus, calculateRepaymentProgress } from "@/lib/utils";
import Link from "next/link";

interface LoanApplicationCardProps {
  application: any;
  detailed?: boolean;
}

export default function LoanApplicationCard({ application, detailed = false }: LoanApplicationCardProps) {
  const status = calculateLoanStatus(application);
  const progress = calculateRepaymentProgress(application);
  
  return (
    <Card className={detailed ? "w-full" : "w-full md:max-w-sm"}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{formatCurrency(application.amount)}</CardTitle>
            <CardDescription>{application.purpose}</CardDescription>
          </div>
          <Badge 
            variant={
              status === 'Active' ? 'default' : 
              status === 'Overdue' ? 'destructive' : 
              status === 'Pending Review' ? 'outline' :
              status === 'Rejected' ? 'destructive' : 'secondary'
            }
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Application ID</p>
            <p className="font-medium">{application.$id || application.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Application Date</p>
            <p className="font-medium">{formatDate(application.createdAt)}</p>
          </div>
        </div>
        
        {detailed && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Loan Type</p>
                <p className="font-medium">{application.loanType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Repayment Period</p>
                <p className="font-medium">{application.repaymentPeriod.replace('_', ' ')}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Assessment</p>
              <div className="flex items-center space-x-2">
                <Progress value={application.riskScore} className="h-2" />
                <span className="text-sm font-medium">{application.riskScore}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{application.riskExplanation}</p>
            </div>
          </>
        )}
        
        {status === 'Active' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">Repayment Progress</p>
              <p className="text-sm font-medium">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/loans/${application.$id || application.id}`}>
            View Details <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 