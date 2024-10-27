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
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Product {
  id: string;
  created_at: string;
  created_by: string;
  name: string;
  description: string | null;
  category: string;
  sku: string;
  status: "active" | "inactive" | "discontinued";
  metadata?: Record<string, string> | null;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  sku: string;
  status: Product["status"];
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    category: "",
    sku: "",
    status: "active",
  });

  const supabase = createClient();

  const categories: string[] = [
    "Electronics",
    "Food",
    "Beverages",
    "Clothing",
    "Furniture",
    "Other",
  ];

  const statuses: Product["status"][] = ["active", "inactive", "discontinued"];

  useEffect(() => {
    getUser();
    fetchProducts();
  }, []);

  const getUser = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return;
    }
    setUser(data?.user ?? null);
    setLoading(false);
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data as Product[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            sku: formData.sku,
            status: formData.status,
          })
          .eq("id", selectedProduct.id);

        if (error) throw error;
      } else {
        // Create new product
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase.from("products").insert([
          {
            ...formData,
            created_by: user.id,
          },
        ]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (product: Product): void => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      sku: product.sku,
      status: product.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) throw error;

        fetchProducts();
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  const resetForm = (): void => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      sku: "",
      status: "active",
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <CardTitle>Products</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="SKU"
                    value={formData.sku}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Product["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {selectedProduct ? "Update" : "Create"} Product
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
                placeholder="Search products..."
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
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "inactive"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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

export default ProductsPage;
