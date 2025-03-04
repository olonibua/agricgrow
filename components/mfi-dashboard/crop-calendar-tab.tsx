import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Calendar, Droplets, Cloud, CloudRain } from "lucide-react";

// Crop growing seasons in Nigeria (simplified)
const CROP_SEASONS = {
  rice: { 
    plantingMonths: [4, 5, 6], 
    harvestMonths: [9, 10, 11], 
    durationDays: 120, 
    needsIrrigation: true,
    monthNames: ["April", "May", "June"],
    harvestMonthNames: ["September", "October", "November"],
    description: "Rice is a staple food in Nigeria. It requires consistent water supply and is typically grown in lowland areas with good water retention or irrigation systems."
  },
  maize: { 
    plantingMonths: [3, 4, 5], 
    harvestMonths: [7, 8, 9], 
    durationDays: 100, 
    needsIrrigation: false,
    monthNames: ["March", "April", "May"],
    harvestMonthNames: ["July", "August", "September"],
    description: "Maize (corn) is widely grown across Nigeria. It's relatively drought-tolerant and can be grown in various soil types, making it accessible to many farmers."
  },
  cassava: { 
    plantingMonths: [3, 4, 5], 
    harvestMonths: [9, 10, 11, 12], 
    durationDays: 270, 
    needsIrrigation: false,
    monthNames: ["March", "April", "May"],
    harvestMonthNames: ["September", "October", "November", "December"],
    description: "Cassava is a hardy crop that can grow in poor soil conditions and with minimal rainfall. It's a major source of carbohydrates in Nigeria."
  },
  yam: { 
    plantingMonths: [11, 12, 1], 
    harvestMonths: [7, 8, 9], 
    durationDays: 240, 
    needsIrrigation: false,
    monthNames: ["November", "December", "January"],
    harvestMonthNames: ["July", "August", "September"],
    description: "Yam is culturally significant in Nigeria. It's typically planted at the end of the rainy season and harvested during the next rainy season."
  },
  tomato: { 
    plantingMonths: [9, 10, 11], 
    harvestMonths: [1, 2, 3], 
    durationDays: 90, 
    needsIrrigation: true,
    monthNames: ["September", "October", "November"],
    harvestMonthNames: ["January", "February", "March"],
    description: "Tomatoes are a high-value crop in Nigeria. They require regular watering and are susceptible to diseases in very humid conditions."
  },
  beans: { 
    plantingMonths: [6, 7], 
    harvestMonths: [9, 10], 
    durationDays: 90, 
    needsIrrigation: false,
    monthNames: ["June", "July"],
    harvestMonthNames: ["September", "October"],
    description: "Beans (cowpeas) are nitrogen-fixing legumes that improve soil fertility. They're drought-tolerant and an important source of protein."
  },
  groundnut: { 
    plantingMonths: [5, 6], 
    harvestMonths: [9, 10], 
    durationDays: 120, 
    needsIrrigation: false,
    monthNames: ["May", "June"],
    harvestMonthNames: ["September", "October"],
    description: "Groundnuts (peanuts) grow well in light, sandy loam soils. They're both a food crop and cash crop in Nigeria."
  },
  sorghum: { 
    plantingMonths: [5, 6], 
    harvestMonths: [9, 10], 
    durationDays: 120, 
    needsIrrigation: false,
    monthNames: ["May", "June"],
    harvestMonthNames: ["September", "October"],
    description: "Sorghum is highly drought-resistant and can withstand high temperatures. It's a staple in northern Nigeria."
  }
};

// Nigerian climate zones
const CLIMATE_ZONES = [
  { id: "rainforest", name: "Rainforest Zone (South)", annualRainfall: "1500-2000mm", rainyMonths: [3, 4, 5, 6, 7, 8, 9, 10] },
  { id: "savanna", name: "Guinea Savanna (Middle Belt)", annualRainfall: "1000-1500mm", rainyMonths: [4, 5, 6, 7, 8, 9] },
  { id: "sudan", name: "Sudan Savanna (North)", annualRainfall: "600-1000mm", rainyMonths: [5, 6, 7, 8, 9] },
  { id: "sahel", name: "Sahel Savanna (Far North)", annualRainfall: "400-600mm", rainyMonths: [6, 7, 8] }
];

export default function CropCalendarTab() {
  const [selectedCrop, setSelectedCrop] = useState("rice");
  const [selectedZone, setSelectedZone] = useState("savanna");
  
  const cropInfo = CROP_SEASONS[selectedCrop as keyof typeof CROP_SEASONS];
  const zoneInfo = CLIMATE_ZONES.find(zone => zone.id === selectedZone);
  
  // Check if the selected crop is suitable for the selected climate zone
  const isSuitable = () => {
    if (!cropInfo || !zoneInfo) return false;
    
    // If crop needs irrigation but zone has limited rainfall
    if (cropInfo.needsIrrigation && zoneInfo.id === "sahel") {
      return false;
    }
    
    // Check if planting months align with rainy season
    const plantingDuringRainy = cropInfo.plantingMonths.some(month => 
      zoneInfo.rainyMonths.includes(month)
    );
    
    return plantingDuringRainy || cropInfo.needsIrrigation;
  };
  
  // Generate months of the year with their planting/harvesting status
  const generateMonthsData = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    return months.map((name, index) => {
      const monthNum = index + 1;
      return {
        name,
        number: monthNum,
        isPlanting: cropInfo?.plantingMonths.includes(monthNum) || false,
        isHarvesting: cropInfo?.harvestMonths.includes(monthNum) || false,
        isRainy: zoneInfo?.rainyMonths.includes(monthNum) || false
      };
    });
  };
  
  const monthsData = generateMonthsData();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crop Growing Calendar</CardTitle>
          <CardDescription>
            Optimal planting and harvesting times for different crops across
            Nigeria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Crop
              </label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a crop" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CROP_SEASONS).map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Climate Zone
              </label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {CLIMATE_ZONES.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={isSuitable() ? "default" : "destructive"}
                className="px-3 py-1"
              >
                {isSuitable() ? "Suitable" : "Not Ideal"}
              </Badge>
              <p className="text-sm">
                {isSuitable()
                  ? `${
                      selectedCrop.charAt(0).toUpperCase() +
                      selectedCrop.slice(1)
                    } is suitable for cultivation in the ${zoneInfo?.name}.`
                  : `${
                      selectedCrop.charAt(0).toUpperCase() +
                      selectedCrop.slice(1)
                    } may not be ideal for the ${
                      zoneInfo?.name
                    } without additional measures.`}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {cropInfo?.description}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Growing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Growing Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {cropInfo?.durationDays} days
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Irrigation Needed</p>
                    <p className="text-sm text-muted-foreground">
                      {cropInfo?.needsIrrigation ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">
                Climate Zone Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Annual Rainfall</p>
                    <p className="text-sm text-muted-foreground">
                      {zoneInfo?.annualRainfall}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Rainy Season</p>
                    <p className="text-sm text-muted-foreground">
                      {zoneInfo?.rainyMonths
                        .map((m) => {
                          const monthNames = [
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ];
                          return monthNames[m - 1];
                        })
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium mb-4">Monthly Calendar</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {monthsData.map((month) => (
                <div
                  key={month.number}
                  className={`p-2 rounded-md border text-center ${
                    month.isPlanting && month.isRainy
                      ? "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-800"
                      : month.isPlanting
                      ? "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-800"
                      : month.isHarvesting
                      ? "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-800"
                      : month.isRainy
                      ? "bg-sky-100 border-sky-300 dark:bg-sky-900/30 dark:border-sky-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700"
                  }`}
                >
                  <p className="text-xs font-medium">{month.name}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {month.isPlanting && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1 py-0 h-4 bg-blue-100 dark:bg-blue-900/30"
                      >
                        Plant
                      </Badge>
                    )}
                    {month.isHarvesting && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1 py-0 h-4 bg-amber-100 dark:bg-amber-900/30"
                      >
                        Harvest
                      </Badge>
                    )}
                    {month.isRainy && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1 py-0 h-4 bg-sky-100 dark:bg-sky-900/30"
                      >
                        Rain
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-300 dark:bg-blue-700"></div>
                <span className="text-xs">Planting</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-700"></div>
                <span className="text-xs">Harvesting</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-sky-300 dark:bg-sky-700"></div>
                <span className="text-xs">Rainy Season</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-300 dark:bg-green-700"></div>
                <span className="text-xs">
                  Optimal Planting (Rain + Planting)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lending Recommendations</CardTitle>
          <CardDescription>
            Guidelines for loan officers based on crop and climate data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">
              Loan Timing Recommendations
            </h3>
            <p className="text-sm">
              {isSuitable()
                ? `Loans for ${selectedCrop} cultivation in the ${
                    zoneInfo?.name
                  } are recommended during ${cropInfo?.monthNames.join(
                    ", "
                  )} to align with optimal planting times.`
                : `Loans for ${selectedCrop} cultivation in the ${zoneInfo?.name} should be carefully evaluated. Consider recommending alternative crops better suited to this region.`}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">
              Risk Factors to Consider
            </h3>
            <ul className="space-y-2">
              {cropInfo?.needsIrrigation && (
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Verify that the farmer has access to reliable irrigation
                    systems, as ${selectedCrop} requires consistent water supply.
                  </span>
                </li>
              )}
              {!cropInfo?.plantingMonths.some((month) =>
                zoneInfo?.rainyMonths.includes(month)
              ) && (
                <li className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    The planting season for ${selectedCrop} does not align well
                    with the rainy season in this region, which may increase
                    risk.
                  </span>
                </li>
              )}
              <li className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Loan repayment schedules should be aligned with expected
                  harvest time (${cropInfo?.harvestMonthNames.join(", ")}) when
                  farmers will have income from crop sales.
                </span>
              </li>
              <li className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Consider the farmer&apos;s experience with ${selectedCrop} cultivation and their historical yields.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">
              Loan Structure Suggestions
            </h3>
            <ul className="space-y-2">
              <li className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Loan disbursement: Consider phased disbursement aligned with
                  critical farming activities (land preparation, planting,
                  fertilization).
                </span>
              </li>
              <li className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Repayment grace period: Allow ${cropInfo?.durationDays / 30} months grace period to align with the crop&apos;s maturity
                  timeline.
                </span>
              </li>
              <li className="text-sm flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>
                  Loan term: For ${selectedCrop}, a term of ${Math.ceil(cropInfo?.durationDays / 30) + 2} to ${Math.ceil(cropInfo?.durationDays / 30) + 4} months is
                  recommended to cover growing period plus post-harvest sales.
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}