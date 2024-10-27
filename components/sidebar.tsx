"use client";

import { useEffect, useState } from "react";
import {
  Box,
  MapPin,
  Truck,
  LayoutDashboard,
  FileBarChart,
  Settings,
  LogOut,
  UserCircle2,
  LogIn,
  ClipboardList,
  Bell,
  HelpCircle,
  LineChart,
  Database,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const menuGroups = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Produtos",
        url: "/dashboard/products",
        icon: Box,
      },
      {
        title: "Locais",
        url: "/dashboard/locations",
        icon: MapPin,
      },
      {
        title: "Cadeia de Suprimentos",
        url: "/dashboard/supply-chain",
        icon: Truck,
      },
    ],
  },
  {
    label: "Monitoramento",
    items: [
      {
        title: "Transações",
        url: "/dashboard/transactions",
        icon: ClipboardList,
      },
      {
        title: "Logística",
        url: "/dashboard/logistics",
        icon: Database,
      },
    ],
  },
  {
    label: "Análise",
    items: [
      {
        title: "Relatórios",
        url: "/dashboard/reports",
        icon: FileBarChart,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: LineChart,
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        title: "Configurações",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Usuários",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Ajuda",
        url: "/dashboard/help",
        icon: HelpCircle,
      },
    ],
  },
];

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error);
        return;
      }
      setUser(data?.user ?? null);
      setLoading(false);
    };

    checkUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar>
      <SidebarContent>
        {user && (
          <>
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.url}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </>
        )}

        {/* User section */}
        <div className="mt-auto pt-4 border-t">
          <SidebarMenu>
            {user ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a
                      href="/dashboard/notifications"
                      className="flex items-center gap-3"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notificações</span>
                      {notifications > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                          {notifications}
                        </span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a
                      href="/dashboard/profile"
                      className="flex items-center gap-3"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      <span>{user.email}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-3 w-full text-primary hover:text-primary"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
