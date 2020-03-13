const express = require('express'); // ExperssJS Framework
const app = express(); // Invoke express to variable for use in application
const cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // HTTP request logger middleware for Node.js
const { captureData, getData, saveSymbols } = require("./utils/dataUtils"); // Fetch data from the API

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // Body-parser middleware

app.post("/api/capture", async (req, res) => {
  const result = await captureData(req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.post("/api/load", async (req, res) => {
  const result = await getData(req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.post("/api/save/symbols", async (req, res) => {
  const result = await saveSymbols(req.body);
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydb', { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
  if (err) {
    console.log('Not connected to the database: ' + err); // Log to console if unable to connect to database
  } else {
    console.log('Successfully connected to MongoDB'); // Log to console if able to connect to database
  }
});

// Start Server
// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log('Running the server on port ' + PORT); // Listen on configured port
});
