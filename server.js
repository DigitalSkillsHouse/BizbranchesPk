const { createServer } = require("http");
const next = require("next");

// Detect production correctly (Railway sets NODE_ENV=production automatically)
const dev = process.env.NODE_ENV !== "production";
// Railway automatically sets PORT environment variable - use it!
// If not set, default to 3000 for local development
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";

console.log("=".repeat(50));
console.log(`Starting Next.js server`);
console.log(`Mode: ${dev ? "development" : "production"}`);
console.log(`Port: ${port} (from PORT env: ${process.env.PORT || "not set"})`);
console.log(`Hostname: ${hostname}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(`Working Directory: ${process.cwd()}`);
console.log("=".repeat(50));

// Verify port is valid
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

let app;
let handle;

try {
  // In production, Next.js needs the .next directory
  const nextOptions = { 
    dev,
    // Explicitly set the directory for production builds
    dir: process.cwd()
  };
  
  console.log(`Next.js options:`, {
    dev,
    dir: process.cwd(),
    hasNextDir: require('fs').existsSync('.next')
  });
  
  app = next(nextOptions);
  handle = app.getRequestHandler();
  console.log("Next.js app initialized successfully");
} catch (err) {
  console.error("Failed to initialize Next.js app:", err);
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    code: err.code
  });
  process.exit(1);
}

console.log("Preparing Next.js app...");
app.prepare()
  .then(() => {
    console.log("Next.js app prepared successfully");
    
    const server = createServer(async (req, res) => {
      const startTime = Date.now();
      const method = req.method || "UNKNOWN";
      const url = req.url || "/";
      
      console.log(`[${new Date().toISOString()}] ${method} ${url}`);
      
      // Set timeout to prevent hanging requests
      req.setTimeout(30000, () => {
        if (!res.headersSent) {
          console.error(`Request timeout: ${method} ${url}`);
          res.statusCode = 504;
          res.end("Gateway Timeout");
        }
      });

      try {
        await handle(req, res);
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode || 200} (${duration}ms)`);
      } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`[${new Date().toISOString()}] Error handling ${method} ${url} (${duration}ms):`, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Internal Server Error");
        }
      }
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

    server.listen(port, hostname, () => {
      console.log("=".repeat(50));
      console.log(`✓ Server is ready and listening`);
      console.log(`  http://${hostname}:${port}`);
      console.log(`  Railway will proxy to this port`);
      console.log("=".repeat(50));
    });

    // Verify server is actually listening
    server.on("listening", () => {
      const address = server.address();
      console.log(`Server listening on:`, address);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("=".repeat(50));
    console.error("CRITICAL: Failed to prepare Next.js app");
    console.error("Error:", err);
    console.error("Stack:", err.stack);
    console.error("=".repeat(50));
    process.exit(1);
  });
