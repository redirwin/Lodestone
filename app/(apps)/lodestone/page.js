"use client";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LayoutDashboard, Wand2, History, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { usePublicResourceHubs } from "./hooks/usePublicResourceHubs";
import { useToast } from "@/hooks/use-toast";
import { useListHistory } from "./hooks/useListHistory";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

export default function Lodestone() {
  const { user, googleLogin } = useAuth();
  const { resourceHubs, loading, error } = usePublicResourceHubs();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHub, setSelectedHub] = useState("");
  const [generatedList, setGeneratedList] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory, clearHistory } = useListHistory();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
      router.push("/lodestone/admin");
    } catch (error) {
      console.error("Error logging in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedHub) return;

    setIsLoading(true);
    try {
      console.log("Generating list for hub:", selectedHub);
      const response = await fetch("/api/lodestone/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hubId: selectedHub })
      });

      if (!response.ok) {
        throw new Error("Failed to generate list");
      }

      const data = await response.json();
      console.log("Generated list data:", data);

      // Log the rarity distribution
      const rarityCounts = data.items.reduce((acc, item) => {
        acc[item.rarity] = (acc[item.rarity] || 0) + item.count;
        return acc;
      }, {});
      console.log("Rarity distribution:", rarityCounts);

      setGeneratedList(data);
      addToHistory(data);
    } catch (error) {
      console.error("Error generating list:", error);
      toast({
        title: "Error",
        description: "Failed to generate list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-xl font-bold">Lodestone</h1>
          <nav>
            {user ? (
              <Button variant="default" asChild>
                <Link href="/lodestone/admin">
                  <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {isLoading ? "Logging in..." : "Login"}
                </span>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 container max-w-7xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome to Lodestone
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground/90 mb-4">
            An RPG Resource Generator
          </h2>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8 text-center">
            Create and manage inventory lists for your RPG encounters.
          </p>

          <div className="flex gap-4 w-full max-w-xl mb-8">
            <Select value={selectedHub} onValueChange={setSelectedHub}>
              <SelectTrigger className="flex-1" disabled={loading}>
                <SelectValue
                  placeholder={
                    loading ? "Loading hubs..." : "Select a resource hub"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {error ? (
                  <SelectItem value="error" disabled>
                    Error loading hubs: {error.message}
                  </SelectItem>
                ) : resourceHubs.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No resource hubs available
                  </SelectItem>
                ) : (
                  resourceHubs.map((hub) => (
                    <SelectItem key={hub.id} value={hub.id}>
                      {hub.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              disabled={!selectedHub || isLoading}
              onClick={handleGenerate}
            >
              <Wand2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isLoading ? "Generating..." : "Generate List"}
              </span>
            </Button>
          </div>

          {generatedList && (
            <div className="w-full max-w-xl border rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">
                {generatedList.hubName} - Generated List
              </h3>
              <div className="space-y-4">
                {generatedList.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">
                        {item.count} {item.name}
                        {item.count > 1 ? "s" : ""}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {item.rarity}
                      </p>
                    </div>
                    <span className="text-primary font-medium">
                      {item.price} gp each
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="mt-4"
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      </main>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>List History</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </DialogHeader>

          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No history available
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {history.map((list, index) => (
                <AccordionItem key={list.timestamp} value={list.timestamp}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <span>{list.hubName}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(list.timestamp), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {list.items.map((item, itemIndex) => (
                        <div
                          key={`${item.id}-${itemIndex}`}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">
                              {item.count} {item.name}
                              {item.count > 1 ? "s" : ""}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {item.rarity}
                            </p>
                          </div>
                          <span className="text-primary font-medium">
                            {item.price} gp each
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
