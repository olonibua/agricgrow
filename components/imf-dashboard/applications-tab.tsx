'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import CropViabilityAnalysis from './crop-viability-analysis';
import ApplicationDetails from './application-details';
import { LoanApplication } from '@/types/loan';

// Common crops in Nigeria
const CROPS = [
  { id: "all", name: "All Crops" },
  { id: "maize", name: "Maize" },
  { id: "rice", name: "Rice" },
  { id: "cassava", name: "Cassava" },
  { id: "yam", name: "Yam" },
  { id: "tomato", name: "Tomatoes" },
  { id: "beans", name: "Beans" },
  { id: "groundnut", name: "Groundnut" },
  { id: "sorghum", name: "Sorghum" }
];

interface ApplicationsTabProps {
  applications: LoanApplication[];
  onApplicationsUpdate: (applications: LoanApplication[]) => void;
}

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
// const getRiskCategory = (score: number): string => {
//   const normalizedScore = normalizeRiskScore(score);
  
//   if (normalizedScore <= 20) return "Very Low Risk";
//   if (normalizedScore <= 40) return "Low Risk";
//   if (normalizedScore <= 60) return "Moderate Risk";
//   if (normalizedScore <= 80) return "High Risk";
//   return "Very High Risk";
// };

export default function ApplicationsTab({ applications, onApplicationsUpdate }: ApplicationsTabProps) {
  const [filteredApplications, setFilteredApplications] = useState<LoanApplication[]>(applications);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cropFilter, setCropFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter applications when search term or filters change
  useEffect(() => {
    let result = [...applications];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.fullName?.toLowerCase().includes(term) || 
        app.$id?.toLowerCase().includes(term) ||
        app.farmerId?.toLowerCase().includes(term) ||
        app.cropType?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // Apply crop filter
    if (cropFilter !== 'all') {
      result = result.filter(app => app.cropType === cropFilter);
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredApplications(result);
  }, [searchTerm, statusFilter, cropFilter, applications, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleApprove = (application: LoanApplication) => {
    const updatedApplications = applications.map(app => {
      if (app.$id === application.$id) {
        return {
          ...app,
          status: 'approved' as 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted',
          approvalDate: new Date().toISOString()
        };
      }
      return app;
    });
    
    onApplicationsUpdate(updatedApplications);
    setSelectedApplication(null);
  };

  const handleReject = (application: LoanApplication) => {
    const updatedApplications = applications.map(app => {
      if (app.$id === application.$id) {
        return {
          ...app,
          status: 'rejected' as 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted',
          rejectionDate: new Date().toISOString()
        };
      }
      return app;
    });
    
    onApplicationsUpdate(updatedApplications);
    setSelectedApplication(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>Review and manage farmer loan applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or crop..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map(crop => (
                  <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('$id')}>
                      ID <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('fullName')}>
                      Farmer <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('amount')}>
                      Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('cropType')}>
                      Crop <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('applicationDate')}>
                      Date <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('riskScore')}>
                      Risk <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="p-0 h-auto font-medium" onClick={() => handleSort('status')}>
                      Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application) => (
                    <TableRow key={application.$id}>
                      <TableCell className="font-medium">{application.$id?.substring(0, 8)}</TableCell>
                      <TableCell>{application.fullName}</TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell>{application.cropType}</TableCell>
                      <TableCell>{formatDate(application.applicationDate || application.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          normalizeRiskScore(application.riskScore) >= 70 ? "destructive" : 
                          normalizeRiskScore(application.riskScore) >= 40 ? "secondary" : "default"
                        }>
                          {normalizeRiskScore(application.riskScore)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          application.status === 'approved' ? "default" : 
                          application.status === 'pending' ? "outline" : "destructive"
                        }>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {selectedApplication && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ApplicationDetails
            application={selectedApplication as LoanApplication}
            onApprove={(app: LoanApplication) => handleApprove(app as LoanApplication)}
            onReject={(app: LoanApplication) => handleReject(app as LoanApplication)}
            onClose={() => setSelectedApplication(null)}
          />
          
          <CropViabilityAnalysis application={selectedApplication} />
        </div>
      )}
    </div>
  );
} 