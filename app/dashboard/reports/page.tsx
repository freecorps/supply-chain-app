"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  PlusCircle,
  Download,
  FileBarChart,
  Calendar,
  Search,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "supply_chain" as const,
    frequency: "monthly" as const,
    status: "active" as const,
  });

  const supabase = createClient();

  const reportTypes = [
    "supply_chain",
    "logistics",
    "inventory",
    "performance",
  ] as const;

  const frequencies = ["daily", "weekly", "monthly", "custom"] as const;

  const statuses = ["active", "paused", "failed"] as const;

  // Sample data for the chart
  const chartData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 500 },
  ];

  useEffect(() => {
    getUser();
    fetchReports();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return;
    }
    setUser(user);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (selectedReport) {
        const { error } = await supabase
          .from("reports")
          .update({
            name: formData.name,
            type: formData.type,
            frequency: formData.frequency,
            status: formData.status,
          })
          .eq("id", selectedReport.id);

        if (error) throw error;
      } else {
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase.from("reports").insert([
          {
            ...formData,
            created_by: user.id,
            last_run: new Date().toISOString(),
            next_run: new Date(Date.now() + 86400000).toISOString(),
          },
        ]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchReports();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDownload = async (report: any) => {
    try {
      console.log("Downloading report:", report.id);
      // Implementar lógica de download
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error downloading report"
      );
    }
  };

  const handleRunNow = async (report: any) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          last_run: new Date().toISOString(),
          next_run: new Date(
            Date.now() + getNextRunInterval(report.frequency)
          ).toISOString(),
          status: "active",
        })
        .eq("id", report.id);

      if (error) throw error;

      fetchReports();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error running report");
    }
  };

  const getNextRunInterval = (frequency: string) => {
    const day = 86400000;
    switch (frequency) {
      case "daily":
        return day;
      case "weekly":
        return day * 7;
      case "monthly":
        return day * 30;
      default:
        return day;
    }
  };

  const resetForm = () => {
    setSelectedReport(null);
    setFormData({
      name: "",
      type: "supply_chain",
      frequency: "monthly",
      status: "active",
    });
  };

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    name="Report Executions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Scheduled Reports</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Schedule Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedReport ? "Edit Report" : "Schedule New Report"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Report Name"
                      value={formData.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          type: value as typeof formData.type,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          frequency: value as typeof formData.frequency,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    {selectedReport ? "Update" : "Schedule"} Report
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-8"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>
                      <FileBarChart className="inline-block mr-2 h-4 w-4" />
                      {report.type.replace("_", " ").toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Calendar className="inline-block mr-2 h-4 w-4" />
                      {report.frequency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          report.status === "active"
                            ? "bg-green-100 text-green-800"
                            : report.status === "paused"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunNow(report)}
                          title="Run Now"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
