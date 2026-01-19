const { createServer } = require("http");
const next = require("next");

// Detect production correctly (Railway sets NODE_ENV=production automatically)
const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";

console.log("=".repeat(50));
console.log(`Starting Next.js server`);
console.log(`Mode: ${dev ? "development" : "production"}`);
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log("=".repeat(50));

let app;
let handle;

try {
  app = next({ dev });
  handle = app.getRequestHandler();
  console.log("Next.js app initialized successfully");
} catch (err) {
  console.error("Failed to initialize Next.js app:", err);
  process.exit(1);
}

console.log("Preparing Next.js app...");
app.prepare()
  .then(() => {
    console.log("Next.js app prepared successfully");
    
    const server = createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error("Error handling request:", err);
        if (!res.headersSent) {
          res.statusCode = 500;
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
      console.log("=".repeat(50));
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
