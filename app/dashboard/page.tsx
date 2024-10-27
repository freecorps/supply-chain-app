"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/utils/supabase/client";
import { Box, AlertCircle, MapPin, Truck, CheckCircle2 } from "lucide-react";

// Interfaces para tipagem
interface DashboardStats {
  totalProducts: number;
  activeLocations: number;
  pendingTransactions: number;
  deliverySuccess: number;
}

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  coordinates: string;
  metadata?: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  status: string;
  metadata?: Record<string, string>;
}

interface Transaction {
  id: string;
  created_at: string;
  created_by: string;
  product_id: string;
  transaction_type: "production" | "transport" | "storage" | "delivery";
  from_location_id?: string;
  to_location_id?: string;
  blockchain_hash: string;
  previous_transaction_id?: string;
  status: "pending" | "completed" | "failed";
  metadata?: Record<string, string>;
  products?: Product;
  from_location?: Location;
  to_location?: Location;
}

interface TransactionHistory {
  month: string;
  transactions: number;
}

interface SystemAlert {
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeLocations: 0,
    pendingTransactions: 0,
    deliverySuccess: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistory[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        // Fetch statistics
        const { data: productsCount, error: productsError } = await supabase
          .from("products")
          .select("id", { count: "exact" });

        if (productsError) throw productsError;

        const { data: locationsCount, error: locationsError } = await supabase
          .from("locations")
          .select("id", { count: "exact" });

        if (locationsError) throw locationsError;

        const { data: pendingTransactions, error: pendingError } =
          await supabase
            .from("supply_chain_transactions")
            .select("id", { count: "exact" })
            .eq("status", "pending");

        if (pendingError) throw pendingError;

        const { data: successfulDeliveries, error: deliveriesError } =
          await supabase
            .from("supply_chain_transactions")
            .select("id", { count: "exact" })
            .eq("transaction_type", "delivery")
            .eq("status", "completed");

        if (deliveriesError) throw deliveriesError;

        setStats({
          totalProducts: productsCount?.length || 0,
          activeLocations: locationsCount?.length || 0,
          pendingTransactions: pendingTransactions?.length || 0,
          deliverySuccess: successfulDeliveries?.length || 0,
        });

        // Fetch recent transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from("supply_chain_transactions")
          .select(
            `
            *,
            products (name),
            from_location: locations!from_location_id (name),
            to_location: locations!to_location_id (name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (transactionsError) throw transactionsError;

        setRecentTransactions((transactions as any) || []);

        // Simulated alerts (in a real app, these would come from your backend)
        setAlerts([
          {
            type: "warning",
            message: "Temperatura acima do ideal no transporte ID-7842",
            timestamp: new Date().toISOString(),
          },
          {
            type: "error",
            message: "Falha na validação do bloco #5123",
            timestamp: new Date().toISOString(),
          },
          {
            type: "info",
            message: "Nova localização adicionada à rede",
            timestamp: new Date().toISOString(),
          },
        ]);

        // Simulated transaction history data
        setTransactionHistory([
          { month: "Jan", transactions: 65 },
          { month: "Fev", transactions: 78 },
          { month: "Mar", transactions: 82 },
          { month: "Abr", transactions: 70 },
          { month: "Mai", transactions: 85 },
          { month: "Jun", transactions: 92 },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusVariant = (
    status: Transaction["status"]
  ): "destructive" | "default" | "secondary" | "outline" | undefined => {
    const variants: Record<
      Transaction["status"],
      "destructive" | "default" | "secondary" | "outline"
    > = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return variants[status];
  };

  const getAlertVariant = (
    type: SystemAlert["type"]
  ): "destructive" | "default" => {
    return type === "error" ? "destructive" : "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Última atualização: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produtos ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Locais Ativos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLocations}</div>
            <p className="text-xs text-muted-foreground">
              Pontos na cadeia de suprimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Transações Pendentes
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliverySuccess}</div>
            <p className="text-xs text-muted-foreground">
              Entregas realizadas com sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Volume de transações nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Recentes</CardTitle>
            <CardDescription>Últimas notificações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <Alert key={index} variant={getAlertVariant(alert.type)}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Últimas movimentações registradas na blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.products?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.from_location?.name || "-"}
                  </TableCell>
                  <TableCell>{transaction.to_location?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
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

export default Dashboard;
