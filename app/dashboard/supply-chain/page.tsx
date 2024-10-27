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
  Search,
  ArrowRightCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface SupplyChainTransaction {
  id: string;
  created_at: string;
  created_by: string;
  product_id: string;
  transaction_type: "production" | "transport" | "storage" | "delivery";
  from_location_id: string | null;
  to_location_id: string | null;
  blockchain_hash: string;
  previous_transaction_id: string | null;
  status: string;
  metadata: Record<string, any> | null;
  // Joined fields
  product: { name: string; sku: string };
  from_location?: { name: string };
  to_location?: { name: string };
}

interface TransactionFormData {
  product_id: string;
  transaction_type: SupplyChainTransaction["transaction_type"];
  from_location_id: string | null;
  to_location_id: string | null;
  status: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Location {
  id: string;
  name: string;
}

const SupplyChainPage = () => {
  const [transactions, setTransactions] = useState<SupplyChainTransaction[]>(
    []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    product_id: "",
    transaction_type: "production",
    from_location_id: null,
    to_location_id: null,
    status: "pending",
  });

  const supabase = createClient();

  const transactionTypes: SupplyChainTransaction["transaction_type"][] = [
    "production",
    "transport",
    "storage",
    "delivery",
  ];

  const statusTypes = ["pending", "in_progress", "completed", "failed"];

  useEffect(() => {
    getUser();
    fetchTransactions();
    fetchProducts();
    fetchLocations();
  }, []);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return;
    }
    setUser(data?.user ?? null);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("supply_chain_transactions")
        .select(
          `
          *,
          product:products(name, sku),
          from_location:locations!supply_chain_transactions_from_location_id_fkey(name),
          to_location:locations!supply_chain_transactions_to_location_id_fkey(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data as SupplyChainTransaction[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku")
      .eq("status", "active");

    if (error) {
      console.error("Error fetching products:", error);
      return;
    }
    setProducts(data);
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase.from("locations").select("id, name");

    if (error) {
      console.error("Error fetching locations:", error);
      return;
    }
    setLocations(data);
  };

  const generateBlockchainHash = () => {
    // Simplified hash generation for demo purposes
    return `0x${Math.random().toString(16).slice(2)}`;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!user) throw new Error("User not authenticated");

      // Get the latest transaction for the selected product
      const { data: lastTransaction } = await supabase
        .from("supply_chain_transactions")
        .select("id")
        .eq("product_id", formData.product_id)
        .order("created_at", { ascending: false })
        .limit(1);

      const newTransaction = {
        ...formData,
        created_by: user.id,
        blockchain_hash: generateBlockchainHash(),
        previous_transaction_id: lastTransaction?.[0]?.id || null,
      };

      const { error } = await supabase
        .from("supply_chain_transactions")
        .insert([newTransaction]);

      if (error) throw error;

      setIsDialogOpen(false);
      resetForm();
      fetchTransactions();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      transaction_type: "production",
      from_location_id: null,
      to_location_id: null,
      status: "pending",
    });
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.product.sku
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type
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
          <CardTitle>Supply Chain Transactions</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={formData.transaction_type}
                    onValueChange={(
                      value: SupplyChainTransaction["transaction_type"]
                    ) => setFormData({ ...formData, transaction_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {transactionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.transaction_type !== "production" && (
                  <div>
                    <Select
                      value={formData.from_location_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, from_location_id: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="From Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Select
                    value={formData.to_location_id || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, to_location_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="To Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusTypes.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Create Transaction
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
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blockchain Hash</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transaction.product.name}
                    <br />
                    <span className="text-sm text-gray-500">
                      {transaction.product.sku}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {transaction.transaction_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {transaction.from_location?.name || "-"}
                  </TableCell>
                  <TableCell>{transaction.to_location?.name || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : transaction.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-mono text-sm truncate max-w-[100px]">
                        {transaction.blockchain_hash}
                      </span>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString()}
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

export default SupplyChainPage;
