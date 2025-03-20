"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#fff",
          color: "#333",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "12px 20px",
          borderRadius: "6px",
          fontSize: "14px",
        },
        success: {
          style: {
            border: "1px solid #0F766E",
            borderLeft: "4px solid #0F766E",
          },
        },
        error: {
          style: {
            border: "1px solid #EF4444",
            borderLeft: "4px solid #EF4444",
          },
          duration: 4000,
        },
      }}
    />
  );
}
