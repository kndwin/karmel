import "./main.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "~/shared/router/tree";
import { ServiceWorkerReloadPrompt } from "~/shared/service-workers/registration";

// Create a new router instance
const router = new Router({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ServiceWorkerReloadPrompt />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
