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
import { PlusCircle, Pencil, UserCog, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string;
  company_name: string;
  role: string;
}

interface UserFormData {
  username: string;
  full_name: string;
  company_name: string;
  role: string;
}

const UsersPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    full_name: "",
    company_name: "",
    role: "",
  });

  const supabase = createClient();

  const roles: string[] = ["Administrator", "Manager", "Operator", "Viewer"];

  useEffect(() => {
    getCurrentUser();
    fetchProfiles();
  }, []);

  const getCurrentUser = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return;
    }
    setCurrentUser(data?.user ?? null);
    setLoading(false);
  };

  const fetchProfiles = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setProfiles(data as Profile[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      if (selectedProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            username: formData.username,
            full_name: formData.full_name,
            company_name: formData.company_name,
            role: formData.role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedProfile.id);

        if (error) throw error;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProfiles();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleEdit = (profile: Profile): void => {
    setSelectedProfile(profile);
    setFormData({
      username: profile.username || "",
      full_name: profile.full_name || "",
      company_name: profile.company_name || "",
      role: profile.role || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = (): void => {
    setSelectedProfile(null);
    setFormData({
      username: "",
      full_name: "",
      company_name: "",
      role: "",
    });
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <CardTitle>Users</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedProfile ? "Edit User" : "Add New User"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    placeholder="Company Name"
                    value={formData.company_name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Select
                    value={formData.role}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, role: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {selectedProfile ? "Update" : "Create"} User
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
                placeholder="Search users..."
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
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.username}</TableCell>
                  <TableCell>{profile.full_name}</TableCell>
                  <TableCell>{profile.company_name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        profile.role === "Administrator"
                          ? "bg-purple-100 text-purple-800"
                          : profile.role === "Manager"
                          ? "bg-blue-100 text-blue-800"
                          : profile.role === "Operator"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {profile.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(profile)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(profile)}
                      >
                        <UserCog className="h-4 w-4" />
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

export default UsersPage;
