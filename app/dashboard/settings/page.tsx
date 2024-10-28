"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  dark_mode: boolean;
  language: string;
}

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    dark_mode: false,
    language: "en",
  });

  const supabase = createClient();

  useEffect(() => {
    getUser();
    // In a real app, you would fetch user settings here
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

  const handleSettingChange = (
    setting: keyof UserSettings,
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, you would save the settings to your database here
      // For now, we'll just show a success message
      alert("Settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      <Card className="min-w-80">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Enable or disable all notifications
                </div>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("notifications_enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive notifications via email
                </div>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("email_notifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Toggle dark mode theme
                </div>
              </div>
              <Switch
                checked={settings.dark_mode}
                onCheckedChange={(checked) =>
                  handleSettingChange("dark_mode", checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
