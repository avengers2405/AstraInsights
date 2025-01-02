import cassandra from "cassandra-driver";
import express from "express";
import { PORT } from "./config.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const cloud = { secureConnectBundle: "./secure-connect-engagement-db.zip" };
const authProvider = new cassandra.auth.PlainTextAuthProvider(
  "token",
  "AstraCS:CfxfAtsYKHmZPvYopBhsZUjI:99725dc52c5de3ba4fc4be72d62bae6ceaea2cdab3f5f4241e0772510e3411e6"
);
const client = new cassandra.Client({
  cloud,
  authProvider,
  keyspace: "default_keyspace", // Add your keyspace name here
});

async function run() {
  await client.connect();
  console.log("Connected to Astra with Keyspace: ", client.metadata.keyspaces);
}

// Create a function to insert data
async function insertEngagementData(pType, likes, shares, comments) {
  const query =
    "INSERT INTO engagement_metrics (id, post_type, likes, shares, comments, created_at) VALUES (uuid(), ?, ?, ?, ?, toTimestamp(now()))";
  const params = [pType, likes, shares, comments];

  try {
    await client.execute(query, params, { prepare: true });
    return true;
  } catch (err) {
    console.error("Error inserting data:", err);
    return false;
  }
}

app.get("/", (req, res) => {
  console.log("connecting to Astra");
  run().catch(console.error);
  return res.status(200).send("Connected to Astra");
});

app.post("/data", async (req, res) => {
  const { pType, likes, shares, comments } = req.body;
  console.log(req.body);

  try {
    // Insert data into Astra DB
    const success = await insertEngagementData(pType, likes, shares, comments);

    if (success) {
      return res.status(201).json({
        message: "Data successfully stored in Astra DB",
        data: { pType, likes, shares, comments },
      });
    } else {
      return res.status(500).json({
        message: "Failed to store data in Astra DB",
      });
    }
  } catch (error) {
    console.error("Error in /data endpoint:", error);
    return res.status(500).json({
      message: "Server error while processing data",
      error: error.message,
    });
  }
});

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  // Connect to Astra DB when server starts
  run().catch(console.error);
});
