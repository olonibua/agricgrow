"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Droplets, Thermometer, Wind } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Common crops in Nigeria
const CROPS = [
  { id: "rice", name: "Rice" },
  { id: "maize", name: "Maize" },
  { id: "cassava", name: "Cassava" },
  { id: "yam", name: "Yam" },
  { id: "tomato", name: "Tomatoes" },
  { id: "beans", name: "Beans" },
  { id: "groundnut", name: "Groundnut" },
  { id: "sorghum", name: "Sorghum" }
];

// Common locations in Nigeria
const LOCATIONS = [
  { id: "lagos", name: "Lagos" },
  { id: "abuja", name: "Abuja" },
  { id: "kano", name: "Kano" },
  { id: "ibadan", name: "Ibadan" },
  { id: "port_harcourt", name: "Port Harcourt" }
];

export default function CropInsightsPage() {
  const [selectedCrop, setSelectedCrop] = useState("rice");
  const [selectedLocation, setSelectedLocation] = useState("lagos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedCrop || !selectedLocation) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/data/crop-insights?crop=${selectedCrop}&location=${selectedLocation}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [selectedCrop, selectedLocation]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Crop Insights & Weather Analysis</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Explore how weather conditions affect crop prices, availability, and growth conditions in Nigeria.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Select Crop</label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue placeholder="Select a crop" />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map(crop => (
                <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(location => (
                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2">Loading crop and weather data...</span>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Weather in {data.weather?.data?.location || selectedLocation}</CardTitle>
              <CardDescription>Source: {data.weather?.source || 'Not available'}</CardDescription>
            </CardHeader>
            <CardContent>
              {data.weather?.data ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 mr-2 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="text-xl font-semibold">{data.weather.data.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Humidity</p>
                      <p className="text-xl font-semibold">{data.weather.data.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Wind Speed</p>
                      <p className="text-xl font-semibold">{data.weather.data.wind_speed} km/h</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="text-xl font-semibold">{data.weather.data.condition}</p>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  Weather data not available
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Crop Price Card */}
          <Card>
            <CardHeader>
              <CardTitle>{CROPS.find(c => c.id === selectedCrop)?.name} Price Trends</CardTitle>
              <CardDescription>Source: {data.prices.source}</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.prices.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#10b981" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Average price: ₦{data.prices.data.reduce((acc: number, item: any) => acc + item.price, 0) / data.prices.data.length}
              </p>
            </CardFooter>
          </Card>
          
          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Based on weather and price data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Growth Conditions</h3>
                  <p className="text-gray-600 dark:text-gray-300">{data.insights.growthConditions}</p>
                </div>
                <div>
                  <h3 className="font-medium">Price Impact</h3>
                  <p className="text-gray-600 dark:text-gray-300">{data.insights.priceImpact}</p>
                </div>
                <div>
                  <h3 className="font-medium">Recommendations</h3>
                  <p className="text-gray-600 dark:text-gray-300">{data.insights.recommendations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Data Tabs */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="economic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="economic">Economic Factors</TabsTrigger>
                  <TabsTrigger value="agricultural">Agricultural Data</TabsTrigger>
                  <TabsTrigger value="historical">Historical Weather</TabsTrigger>
                </TabsList>
                <TabsContent value="economic" className="py-4">
                  <div className="space-y-6">
                    <h3 className="font-medium">Economic Indicators</h3>
                    <p className="text-sm text-gray-500">Source: {data.economic.source}</p>
                    
                    {/* GDP Data */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">GDP (current US$)</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (USD)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.economic.data.gdp.map((item: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{(item.value / 1000000000).toFixed(2)} billion</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* CPI Data */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Consumer Price Index (2010 = 100)</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.economic.data.cpi.map((item: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.value?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="agricultural" className="py-4">
                  <div className="space-y-6">
                    <h3 className="font-medium">Agricultural Data</h3>
                    <p className="text-sm text-gray-500">Source: {data.agricultural.source}</p>
                    
                    {/* Agricultural Land Data */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Agricultural Land (% of land area)</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.agricultural.data.landUse.map((item: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.value ? item.value.toFixed(2) : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Crop Production Index */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Crop Production Index (2014-2016 = 100)</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.agricultural.data.cropProduction.map((item: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.value ? item.value.toFixed(2) : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Agriculture Value Added */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Agriculture, Forestry, and Fishing (% of GDP)</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data.agricultural.data.valueAdded.map((item: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{item.value ? item.value.toFixed(2) : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="historical" className="py-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Historical Weather Data</h3>
                    <p>Last 7 days in {data.weather?.data?.location || selectedLocation}</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.historicalWeather}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                          <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#10b981" name="Temperature (°C)" />
                          <Line yAxisId="right" type="monotone" dataKey="rainfall" stroke="#3b82f6" name="Rainfall (mm)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 