"use client";

import { Toaster } from "react-hot-toast";

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#00103D",
          color: "#fff",
        },
        success: {
          style: {
            background: "#10B981",
          },
        },
        error: {
          style: {
            background: "#EF4444",
          },
        },
      }}
    />
  );
};

export default ToastProvider;
