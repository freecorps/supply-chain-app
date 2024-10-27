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
import { PlusCircle, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Location {
  id: string;
  created_at: string;
  name: string;
  address: string;
  type: "warehouse" | "distribution_center" | "retail";
  coordinates: string; // Stored as point in DB, represented as "lat,lng" string
  metadata?: Record<string, string> | null;
}

interface LocationFormData {
  name: string;
  address: string;
  type: Location["type"];
  coordinates: string;
}

const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    address: "",
    type: "warehouse",
    coordinates: "",
  });

  const supabase = createClient();

  const locationTypes: Location["type"][] = [
    "warehouse",
    "distribution_center",
    "retail",
  ];

  useEffect(() => {
    getUser();
    fetchLocations();
  }, []);

  const getUser = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return;
    }
    setLoading(false);
  };

  const fetchLocations = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setLocations(data as Location[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const [lat, lng] = formData.coordinates.split(",").map(Number);
      const point = `(${lat},${lng})`;

      if (selectedLocation) {
        // Update existing location
        const { error } = await supabase
          .from("locations")
          .update({
            name: formData.name,
            address: formData.address,
            type: formData.type,
            coordinates: point,
          })
          .eq("id", selectedLocation.id);

        if (error) throw error;
      } else {
        // Create new location
        const { error } = await supabase.from("locations").insert([
          {
            name: formData.name,
            address: formData.address,
            type: formData.type,
            coordinates: point,
          },
        ]);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (location: Location): void => {
    setSelectedLocation(location);
    const coords = location.coordinates.replace("(", "").replace(")", "");
    setFormData({
      name: location.name,
      address: location.address,
      type: location.type,
      coordinates: coords,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        const { error } = await supabase
          .from("locations")
          .delete()
          .eq("id", id);

        if (error) throw error;

        fetchLocations();
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

  const resetForm = (): void => {
    setSelectedLocation(null);
    setFormData({
      name: "",
      address: "",
      type: "warehouse",
      coordinates: "",
    });
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLocationType = (type: Location["type"]): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Locations</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedLocation ? "Edit Location" : "Add New Location"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Location Name"
                    value={formData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Location["type"]) =>
                      setFormData({ ...formData, type: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatLocationType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Coordinates (lat,lng)"
                    value={formData.coordinates}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, coordinates: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {selectedLocation ? "Update" : "Create"} Location
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
                placeholder="Search locations..."
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
                <TableHead>Address</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formatLocationType(location.type)}
                    </span>
                  </TableCell>
                  <TableCell>{location.coordinates}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-4 w-4" />
                        </a>
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

export default LocationsPage;
