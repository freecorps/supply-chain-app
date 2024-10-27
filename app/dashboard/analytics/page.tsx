"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import _ from "lodash";

interface Transaction {
  id: string;
  created_at: string;
  transaction_type: string;
  product_id: string;
  status: string;
}

interface LogisticsDetail {
  id: string;
  transaction_id: string;
  temperature: number;
  humidity: number;
  transport_duration: string;
}

const AnalyticsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [logisticsDetails, setLogisticsDetails] = useState<LogisticsDetail[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("week");

  const supabase = createClient();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("supply_chain_transactions")
          .select("*")
          .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;

      // Fetch logistics details
      const { data: logisticsData, error: logisticsError } = await supabase
        .from("logistics_details")
        .select("*");

      if (logisticsError) throw logisticsError;

      setTransactions(transactionsData as Transaction[]);
      setLogisticsDetails(logisticsData as LogisticsDetail[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionsByType = () => {
    const grouped = _.groupBy(transactions, "transaction_type");
    return Object.entries(grouped).map(([type, items]) => ({
      name: type,
      value: items.length,
    }));
  };

  const getTransactionsTrend = () => {
    const grouped = _.groupBy(transactions, (transaction) => {
      const date = new Date(transaction.created_at);
      return date.toISOString().split("T")[0];
    });

    return Object.entries(grouped).map(([date, items]) => ({
      date,
      count: items.length,
    }));
  };

  const getAverageTemperature = () => {
    const grouped = _.groupBy(logisticsDetails, (detail) => {
      const transaction = transactions.find(
        (t) => t.id === detail.transaction_id
      );
      return transaction?.created_at.split("T")[0];
    });

    return Object.entries(grouped).map(([date, items]) => ({
      date,
      temperature: _.meanBy(items, "temperature"),
      humidity: _.meanBy(items, "humidity"),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supply Chain Analytics</h1>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {_.uniqBy(transactions, "product_id").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {_.round(_.meanBy(logisticsDetails, "temperature"), 1)}°C
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Transit Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {_.round(
                _.meanBy(logisticsDetails, (d) =>
                  parseInt(d.transport_duration)
                ),
                0
              )}{" "}
              hrs
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="temperature">Temperature & Humidity</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Trends</CardTitle>
              <CardDescription>
                Number of transactions over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTransactionsTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature & Humidity Trends</CardTitle>
              <CardDescription>
                Environmental conditions over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getAverageTemperature()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Type Distribution</CardTitle>
              <CardDescription>Breakdown by transaction type</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getTransactionsByType()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getTransactionsByType().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
