const express = require("express");
const app = express();
require("dotenv").config();

// Import routes
const sportsRoutes = require("./routes/sportsRoutes");

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1", sportsRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;