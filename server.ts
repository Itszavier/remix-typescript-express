/** @format */

import express from "express";
import remix from "@remix-run/express";

import { createServer } from "vite";
import { ServerBuild } from "@remix-run/node";

const app = express();

async function startServer() {
  const vite =
    process.env.NODE_ENV === "production" // Check if we're in production mode
      ? null // If production, don't use Vite
      : await createServer({
          // If development, create a Vite server
          server: { middlewareMode: true }, // Configure Vite for middleware mode
        });
  // Use Vite middleware in development, static serving in production
  app.use(vite ? vite.middlewares : express.static("build/client"));

  const build = vite
    ? ((await vite.ssrLoadModule("virtual:remix/server-build")) as ServerBuild) // Load Remix server build using Vite in development
    : await import("./build/server/index.js"); // Import the pre-built server build in production

  // Serve static assets from the build/client directory
  
  app.use(express.static("public", { maxAge: "1h" }));
  app.use(express.static("build/client"));

  // Handle all requests with the Remix request handler
  app.all("*", remix.createRequestHandler({ build }));

  // Log a message when the server starts
  app.listen(3000, () => {
    console.log("App listening on http://localhost:3000");
  });
}


startServer()
