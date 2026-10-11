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
          setSavedProducts(
            parsed.filter(
              (product) =>
                product && product.id !== undefined && product.id !== null,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Saved products load error:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
    } catch (error) {
      console.error("Saved products save error:", error);
    }
  }, [savedProducts, isLoaded]);

  function toggleSaved(product) {
    if (!product || product.id === undefined || product.id === null) {
      return;
    }

    setSavedProducts((previous) => {
      const exists = previous.some(
        (item) => String(item.id) === String(product.id),
      );

      if (exists) {
        return previous.filter(
          (item) => String(item.id) !== String(product.id),
        );
      }

      return [...previous, product];
    });
  }

  function isSaved(productId) {
    return savedProducts.some((item) => String(item.id) === String(productId));
  }

  return (
    <SavedContext.Provider
      value={{ savedProducts, toggleSaved, isSaved, isLoaded }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
