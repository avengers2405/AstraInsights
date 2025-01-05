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
  const { postType, like, share, comments } = req.body;
  console.log(req.body);

  try {
    // Insert data into Astra DB
    const success = await insertEngagementData(postType, like, share, comments);

    if (success) {
      return res.status(201).json({
        message: "Data successfully stored in Astra DB",
        data: { postType, like, share, comments },
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

// Note: Replace **<YOUR_APPLICATION_TOKEN>** with your actual Application token

class LangflowClient {
  constructor(baseURL, applicationToken) {
      this.baseURL = baseURL;
      this.applicationToken = applicationToken;
  }
  async post(endpoint, body, headers = {"Content-Type": "application/json"}) {
      headers["Authorization"] = `Bearer ${this.applicationToken}`;
      headers["Content-Type"] = "application/json";
      const url = `${this.baseURL}${endpoint}`;
      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify(body)
          });

          const responseMessage = await response.json();
          if (!response.ok) {
              throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
          }
          return responseMessage;
      } catch (error) {
          console.error('Request Error:', error.message);
          throw error;
      }
  }

  async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
      const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
      return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
  }

  handleStream(streamUrl, onUpdate, onClose, onError) {
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = event => {
          const data = JSON.parse(event.data);
          onUpdate(data);
      };

      eventSource.onerror = event => {
          console.error('Stream Error:', event);
          onError(event);
          eventSource.close();
      };

      eventSource.addEventListener("close", () => {
          onClose('Stream closed');
          eventSource.close();
      });

      return eventSource;
  }

  async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
      try {
          const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, stream, tweaks);
          console.log('Init Response:', initResponse);
          if (stream && initResponse && initResponse.outputs && initResponse.outputs[0].outputs[0].artifacts.stream_url) {
              const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
              console.log(`Streaming from: ${streamUrl}`);
              this.handleStream(streamUrl, onUpdate, onClose, onError);
          }
          return initResponse;
      } catch (error) {
          console.error('Error running flow:', error);
          onError('Error initiating session');
      }
  }
}

async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
  const flowIdOrName = 'socialendpoint';
  const langflowId = 'be4cf784-d2ed-4003-b857-523a7dc3b1e4';
  const applicationToken = process.env.LANGFLOW_APPLICATION_TOKEN;
  const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com',
      applicationToken);

  try {
    const tweaks = {
"File-0TGhY": {},
"SplitText-7sDod": {},
"AstraDB-X3pDa": {},
"ParseData-2iRi6": {},
"ChatInput-aEyt6": {},
"CombineText-wLvA4": {},
"ChatOutput-zWNfv": {},
"Prompt-gfKVz": {},
"GroqModel-3BDkV": {}
};
    var response = await langflowClient.runFlow(
        flowIdOrName,
        langflowId,
        inputValue,
        inputType,
        outputType,
        tweaks,
        stream,
        (data) => console.log("Received:", data.chunk), // onUpdate
        (message) => console.log("Stream Closed:", message), // onClose
        (error) => console.log("Stream Error:", error) // onError
    );
    if (!stream && response && response.outputs) {
        const flowOutputs = response.outputs[0];
        const firstComponentOutputs = flowOutputs.outputs[0];
        const output = firstComponentOutputs.outputs.message;

        console.log("Final Output:", output.message.text);
        return output.message.text;
    }
  } catch (error) {
    console.error('Main Error', error.message);
  }
}

app.post("/query", async (req, res) => {
  const { inputValue } = req.body;
  console.log("question:  ", inputValue);

  const args = [inputValue];
  const response = await main(
    args[0], // inputValue
    args[1], // inputType
    args[2], // outputType
    args[3] === 'true' // stream
  );
  console.log("args: ", args);
  console.log("response:  ", response);
  return res.status(200).send(response);
});

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  // Connect to Astra DB when server starts
  run().catch(console.error);
});
