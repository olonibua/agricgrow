import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Crop growing seasons in Nigeria (simplified)
const CROP_SEASONS = {
  rice: { 
    plantingMonths: [4, 5, 6], 
    harvestMonths: [9, 10, 11], 
    durationDays: 120, 
    needsIrrigation: true,
    monthNames: ["April", "May", "June"],
    harvestMonthNames: ["September", "October", "November"]
  },
  maize: { 
    plantingMonths: [3, 4, 5], 
    harvestMonths: [7, 8, 9], 
    durationDays: 100, 
    needsIrrigation: false,
    monthNames: ["March", "April", "May"],
    harvestMonthNames: ["July", "August", "September"]
  },
  cassava: { 
    plantingMonths: [3, 4, 5], 
    harvestMonths: [9, 10, 11, 12], 
    durationDays: 270, 
    needsIrrigation: false,
    monthNames: ["March", "April", "May"],
    harvestMonthNames: ["September", "October", "November", "December"]
  },
  yam: { 
    plantingMonths: [11, 12, 1], 
    harvestMonths: [7, 8, 9], 
    durationDays: 240, 
    needsIrrigation: false,
    monthNames: ["November", "December", "January"],
    harvestMonthNames: ["July", "August", "September"]
  },
  tomato: { 
    plantingMonths: [9, 10, 11], 
    harvestMonths: [1, 2, 3], 
    durationDays: 90, 
    needsIrrigation: true,
    monthNames: ["September", "October", "November"],
    harvestMonthNames: ["January", "February", "March"]
  },
  beans: { 
    plantingMonths: [6, 7], 
    harvestMonths: [9, 10], 
    durationDays: 90, 
    needsIrrigation: false,
    monthNames: ["June", "July"],
    harvestMonthNames: ["September", "October"]
  },
  groundnut: { 
    plantingMonths: [5, 6], 
    harvestMonths: [9, 10], 
    durationDays: 120, 
    needsIrrigation: false,
    monthNames: ["May", "June"],
    harvestMonthNames: ["September", "October"]
  },
  sorghum: { 
    plantingMonths: [5, 6], 
    harvestMonths: [9, 10], 
    durationDays: 120, 
    needsIrrigation: false,
    monthNames: ["May", "June"],
    harvestMonthNames: ["September", "October"]
  }
};

interface CropViabilityAnalysisProps {
  application: any;
}

export default function CropViabilityAnalysis({ application }: CropViabilityAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>({});

  useEffect(() => {
    analyzeCropViability(application);
  }, [application]);

  const analyzeCropViability = (application: any) => {
    const { cropType, farmLocation, hasIrrigation, expectedHarvestDate } = application;
    const cropInfo = CROP_SEASONS[cropType as keyof typeof CROP_SEASONS];
    
    if (!cropInfo) {
      setAnalysis({
        viable: false,
        message: "Unknown crop type. Cannot analyze viability.",
        recommendations: ["Consider common crops in your region with established market demand."]
      });
      return;
    }
    
    // Get current date and expected harvest date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const harvestDate = expectedHarvestDate ? new Date(expectedHarvestDate) : null;
    
    // Check if current month is a good planting month
    const isGoodPlantingTime = cropInfo.plantingMonths.includes(currentMonth);
    
    // Check if irrigation is needed but not available
    const irrigationIssue = cropInfo.needsIrrigation && !hasIrrigation;
    
    // Check if expected harvest date aligns with crop duration
    let harvestDateIssue = false;
    let harvestDateMessage = "";
    
    if (harvestDate) {
      const plantToHarvestDays = Math.floor((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const durationDifference = Math.abs(plantToHarvestDays - cropInfo.durationDays);
      
      harvestDateIssue = durationDifference > 30; // More than a month off
      harvestDateMessage = harvestDateIssue 
        ? `Expected harvest date is ${plantToHarvestDays < cropInfo.durationDays ? 'too early' : 'too late'}. ${cropType} typically takes ${cropInfo.durationDays} days to mature.`
        : `Expected harvest date aligns well with typical ${cropType} growing duration.`;
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (!isGoodPlantingTime) {
      recommendations.push(`Consider planting ${cropType} during optimal months: ${cropInfo.monthNames.join(', ')}.`);
    }
    
    if (irrigationIssue) {
      recommendations.push(`${cropType} requires irrigation. Consider investing in irrigation systems or choosing crops that require less water.`);
    }
    
    if (harvestDateIssue) {
      recommendations.push(`Adjust expected harvest date to align with ${cropType}'s typical growing duration of ${cropInfo.durationDays} days.`);
    }
    
    // Determine overall viability
    const viable = isGoodPlantingTime && !irrigationIssue && !harvestDateIssue;
    
    // Generate overall message
    let message = viable 
      ? `${cropType} is viable for planting now with the current conditions.` 
      : `There are concerns with growing ${cropType} under the current conditions.`;
    
    setAnalysis({
      viable,
      message,
      recommendations,
      plantingMonths: cropInfo.monthNames.join(', '),
      harvestMonths: cropInfo.harvestMonthNames.join(', '),
      durationDays: cropInfo.durationDays,
      needsIrrigation: cropInfo.needsIrrigation ? "Required" : "Not required",
      harvestDateMessage
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Viability Analysis</CardTitle>
        <CardDescription>Based on crop type and growing conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.viable !== undefined && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={analysis.viable ? "default" : "destructive"} className="px-3 py-1">
                {analysis.viable ? "Viable" : "Concerns"}
              </Badge>
              <p className="text-sm">{analysis.message}</p>
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <p className="text-sm font-medium">Optimal Planting Months</p>
                <p className="text-sm">{analysis.plantingMonths}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Typical Harvest Months</p>
                <p className="text-sm">{analysis.harvestMonths}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Growing Duration</p>
                <p className="text-sm">{analysis.durationDays} days</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Irrigation Requirement</p>
                <p className="text-sm">{analysis.needsIrrigation}</p>
              </div>
              
              {analysis.harvestDateMessage && (
                <div>
                  <p className="text-sm font-medium">Harvest Date Assessment</p>
                  <p className="text-sm">{analysis.harvestDateMessage}</p>
                </div>
              )}
            </div>
            
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Recommendations</p>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
