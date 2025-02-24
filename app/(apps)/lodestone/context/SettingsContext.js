"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useToast } from "@/hooks/use-toast";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    showDeletionConfirmation: true,
    deletionConfirmationDisabledAt: null // Track when it was disabled
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Monitor for auto re-enable
  useEffect(() => {
    if (
      !settings.showDeletionConfirmation &&
      settings.deletionConfirmationDisabledAt
    ) {
      const timeoutId = setTimeout(async () => {
        try {
          const docRef = doc(db, "settings", "general");
          const newSettings = {
            ...settings,
            showDeletionConfirmation: true,
            deletionConfirmationDisabledAt: null
          };

          // Update Firestore
          await setDoc(docRef, newSettings);

          // Explicitly update local state
          setSettings(newSettings);

          // Show a toast notification
          toast({
            title: "Settings Updated",
            description: "Delete confirmation has been automatically re-enabled"
          });
        } catch (error) {
          console.error("Failed to re-enable deletion confirmation:", error);
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timeoutId);
    }
  }, [
    settings.showDeletionConfirmation,
    settings.deletionConfirmationDisabledAt,
    toast
  ]);

  useEffect(() => {
    const docRef = doc(db, "settings", "general");

    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data());
        } else {
          const defaultSettings = {
            showDeletionConfirmation: true,
            deletionConfirmationDisabledAt: null
          };
          setDoc(docRef, defaultSettings);
          setSettings(defaultSettings);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const docRef = doc(db, "settings", "general");
      await setDoc(docRef, newSettings);
    } catch (error) {
      throw error;
    }
  };

  // Modify the toggle function to include timestamp
  const toggleDeletionConfirmation = async (checked) => {
    const newSettings = {
      ...settings,
      showDeletionConfirmation: checked,
      deletionConfirmationDisabledAt: checked ? null : new Date().toISOString()
    };
    await updateSettings(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleDeletionConfirmation,
        loading,
        error
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
