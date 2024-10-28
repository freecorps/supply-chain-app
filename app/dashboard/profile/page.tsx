"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: string;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  company_name: string | null;
  role: string | null;
}

interface ProfileFormData {
  username: string;
  full_name: string;
  company_name: string;
  role: string;
}

const ProfilePage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    full_name: "",
    company_name: "",
    role: "",
  });

  const supabase = createClient();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getUser = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(data?.user ?? null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const fetchProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        username: data.username || "",
        full_name: data.full_name || "",
        company_name: data.company_name || "",
        role: data.role || "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate username length (from schema constraint)
      if (formData.username.length < 3) {
        throw new Error("Username must be at least 3 characters long");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          company_name: formData.company_name,
          role: formData.role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Profile updated successfully");
      fetchProfile(); // Refresh profile data
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  minLength={3}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  placeholder="Enter full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <Input
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <Input
                  placeholder="Enter role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
