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
  Pencil,
  Trash2,
  Search,
  ThermometerSun,
  Truck,
  Database,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface LogisticsDetail {
  id: string;
  transaction_id: string;
  temperature: number;
  humidity: number;
  transport_vehicle: string;
  transport_duration: string;
  storage_conditions: string;
  quality_checks: Record<string, string>;
  additional_data?: Record<string, string>;
}

interface SupplyChainTransaction {
  id: string;
  product_id: string;
  transaction_type: string;
  from_location_id: string;
  to_location_id: string;
  status: string;
}

interface LogisticsFormData {
  transaction_id: string;
  temperature: number;
  humidity: number;
  transport_vehicle: string;
  transport_duration: string;
  storage_conditions: string;
}

const LogisticsPage = () => {
  const [logisticsDetails, setLogisticsDetails] = useState<LogisticsDetail[]>(
    []
  );
  const [transactions, setTransactions] = useState<SupplyChainTransaction[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLogistics, setSelectedLogistics] =
    useState<LogisticsDetail | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<LogisticsFormData>({
    transaction_id: "",
    temperature: 0,
    humidity: 0,
    transport_vehicle: "",
    transport_duration: "",
    storage_conditions: "",
  });

  const supabase = createClient();

  const transportVehicles = [
    "Truck",
    "Van",
    "Ship",
    "Airplane",
    "Train",
    "Other",
  ];

  const storageConditions = [
    "Room Temperature",
    "Refrigerated",
    "Frozen",
    "Climate Controlled",
    "Humidity Controlled",
  ];

  useEffect(() => {
    getUser();
    fetchLogisticsDetails();
    fetchTransactions();
  }, []);

  const getUser = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return;
    }
    setUser(data?.user ?? null);
  };

  const fetchLogisticsDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("logistics_details").select(`
          *,
          supply_chain_transactions (
            id,
            product_id,
            transaction_type,
            from_location_id,
            to_location_id,
            status
          )
        `);

      if (error) throw error;

      setLogisticsDetails(data as LogisticsDetail[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("supply_chain_transactions")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      setTransactions(data as SupplyChainTransaction[]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      if (selectedLogistics) {
        // Update existing logistics detail
        const { error } = await supabase
          .from("logistics_details")
          .update({
            temperature: formData.temperature,
            humidity: formData.humidity,
            transport_vehicle: formData.transport_vehicle,
            transport_duration: formData.transport_duration,
            storage_conditions: formData.storage_conditions,
          })
          .eq("id", selectedLogistics.id);

        if (error) throw error;
      } else {
        // Create new logistics detail
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase.from("logistics_details").insert([
          {
            ...formData,
            quality_checks: {},
          },
        ]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLogisticsDetails();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (logistics: LogisticsDetail): void => {
    setSelectedLogistics(logistics);
    setFormData({
      transaction_id: logistics.transaction_id,
      temperature: logistics.temperature,
      humidity: logistics.humidity,
      transport_vehicle: logistics.transport_vehicle,
      transport_duration: logistics.transport_duration,
      storage_conditions: logistics.storage_conditions,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (
      window.confirm("Are you sure you want to delete this logistics record?")
    ) {
      try {
        const { error } = await supabase
          .from("logistics_details")
          .delete()
          .eq("id", id);

        if (error) throw error;

        fetchLogisticsDetails();
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  const resetForm = (): void => {
    setSelectedLogistics(null);
    setFormData({
      transaction_id: "",
      temperature: 0,
      humidity: 0,
      transport_vehicle: "",
      transport_duration: "",
      storage_conditions: "",
    });
  };

  const filteredLogistics = logisticsDetails.filter(
    (logistics) =>
      logistics.transport_vehicle
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      logistics.storage_conditions
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Logistics Monitoring</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Logistics Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedLogistics
                    ? "Edit Logistics Record"
                    : "Add New Logistics Record"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Select
                    value={formData.transaction_id}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, transaction_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Transaction" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactions.map((transaction) => (
                        <SelectItem key={transaction.id} value={transaction.id}>
                          {transaction.transaction_type} -{" "}
                          {transaction.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Temperature (°C)"
                      value={formData.temperature}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Humidity (%)"
                      value={formData.humidity}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          humidity: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Select
                    value={formData.transport_vehicle}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, transport_vehicle: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Transport Vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {transportVehicles.map((vehicle) => (
                        <SelectItem key={vehicle} value={vehicle}>
                          {vehicle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Transport Duration (e.g., 2 hours)"
                    value={formData.transport_duration}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({
                        ...formData,
                        transport_duration: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Select
                    value={formData.storage_conditions}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, storage_conditions: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Storage Conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageConditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {selectedLogistics ? "Update" : "Create"} Logistics Record
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
                placeholder="Search logistics records..."
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
                <TableHead>Transaction ID</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Humidity</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Storage Conditions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogistics.map((logistics) => (
                <TableRow key={logistics.id}>
                  <TableCell>
                    {logistics.transaction_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ThermometerSun className="h-4 w-4 mr-2" />
                      {logistics.temperature}°C
                    </div>
                  </TableCell>
                  <TableCell>{logistics.humidity}%</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      {logistics.transport_vehicle}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      {logistics.storage_conditions}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(logistics)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(logistics.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
  );
};

export default LogisticsPage;
