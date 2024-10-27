import type { Metadata } from "next";
import { AppSidebar } from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-screen flex flex-col">
        <SidebarTrigger />
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}