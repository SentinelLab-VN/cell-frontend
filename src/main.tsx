import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { ApiError } from "@/lib/api/client";
import { captureReferral } from "@/lib/referral";
import { router } from "./router";
import "./styles/globals.css";

captureReferral();

// @stellar/stellar-sdk expects Node's Buffer to exist.
(globalThis as { Buffer?: typeof Buffer }).Buffer ??= Buffer;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // A 4xx is an answer, not a blip: asking again gets the same one.
      retry: (failures, error) => !(error instanceof ApiError && error.status < 500) && failures < 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>,
);
