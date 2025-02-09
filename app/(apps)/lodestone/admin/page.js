"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  MapPin,
  Settings as SettingsIcon,
  Home,
  LogOut
} from "lucide-react";
import ResourceHubs from "./components/resource-hubs";
import Provisions from "./components/provisions";
import Settings from "./components/settings";
import { RarityProvider } from "../context/RarityContext";
import { Toaster } from "@/components/ui/toaster";
import { ResourceHubProvider } from "../context/ResourceHubContext";
import { ProvisionProvider } from "../context/ProvisionContext";

export default function Admin() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("provisions");
  const [showHubForm, setShowHubForm] = useState(false);
  const [showProvisionForm, setShowProvisionForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/lodestone");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/lodestone");
  };

  const handleAddClick = () => {
    if (activeTab === "hubs") {
      setShowHubForm(true);
    } else if (activeTab === "provisions") {
      setShowProvisionForm(true);
    }
  };

  if (!user) return null;

  return (
    <RarityProvider>
      <ResourceHubProvider>
        <ProvisionProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
                <h1 className="text-xl font-bold">Lodestone Admin</h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={() => router.push("/lodestone")}
                  >
                    <Home className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                  <Button onClick={handleLogout}>
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <Tabs
                defaultValue="provisions"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="sticky top-[57px] z-40 max-w-7xl mx-auto w-full">
                    <div className="px-4 sm:px-8">
                      <TabsList className="w-full justify-start p-0 h-12">
                        <TabsTrigger
                          value="provisions"
                          className="flex-1 flex items-center gap-2 ml-2"
                        >
                          <Package className="h-4 w-4" />
                          <span>Resources</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="hubs"
                          className="flex-1 flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Resource Hubs</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="w-14">
                          <SettingsIcon className="h-4 w-4" />
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto w-full">
                  <div className="p-4 sm:p-8">
                    <TabsContent value="hubs" className="m-0">
                      <ResourceHubs
                        isFormOpen={showHubForm}
                        setIsFormOpen={setShowHubForm}
                      />
                    </TabsContent>
                    <TabsContent value="provisions" className="m-0">
                      <Provisions
                        isFormOpen={showProvisionForm}
                        setIsFormOpen={setShowProvisionForm}
                      />
                    </TabsContent>
                    <TabsContent value="settings" className="m-0">
                      <Settings />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </main>

            {/* Floating Add Button - Hide in settings tab */}
            {activeTab !== "settings" && (
              <Button
                size="icon"
                className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
                onClick={handleAddClick}
              >
                <Plus className="h-6 w-6" />
              </Button>
            )}
          </div>
          <Toaster />
        </ProvisionProvider>
      </ResourceHubProvider>
    </RarityProvider>
  );
}
