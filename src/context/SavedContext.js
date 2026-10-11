"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SavedContext = createContext();

export function SavedProvider({ children }) {
  const [savedProducts, setSavedProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("savedProducts");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSavedProducts(parsed);
        }
      }
    } catch (error) {
      console.error("Saved products load error:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
    }
  }, [savedProducts, isLoaded]);

  function toggleSaved(product) {
    setSavedProducts((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(product.id),
      );

      return exists
        ? previous.filter((item) => String(item.id) !== String(product.id))
        : [...previous, product];
    });
  }

  function isSaved(productId) {
    return savedProducts.some((item) => String(item.id) === String(productId));
  }

  return (
    <SavedContext.Provider value={{ savedProducts, toggleSaved, isSaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
