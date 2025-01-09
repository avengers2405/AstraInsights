import cassandra from "cassandra-driver";
import express from "express";
import { PORT } from "./config.js";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
// import { fileTypeFromBuffer } from "file-type";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
  console.log("Connected to Astra.");
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
          // console.log('Init Response o/p: ', initResponse.outputs[0].outputs[0].outputs);
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
  const flowIdOrName = '9fefd2d3-f63f-417c-9f35-abd6a3e3cc8a';
  const langflowId = 'be4cf784-d2ed-4003-b857-523a7dc3b1e4';
  const applicationToken = process.env.LANGFLOW_APPLICATION_TOKEN;
  const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com',
      applicationToken);

  try {
    const tweaks = {
"ChatInput-MjkNj": {
  "background_color": "",
  "chat_icon": "",
  "files": "",
  // "input_value": "give me top 10 most valuable insights",
  "sender": "User",
  "sender_name": "User",
  "session_id": "",
  "should_store_message": true,
  "text_color": ""
},
"ParseData-qm912": {
  "sep": "\n",
  "template": "{text}"
},
"Prompt-Os2Fa": {
  "context": "",
  "question": "",
  "template": "{context}\n\n---\n\nGiven the context above, answer the question as best as possible.\nYou are a social media analytics agent. You will be given media's likes, Shares and Comments data , you need to provide proper insights for it.\n\n\nQuestion: {question}\n\nNote: \n 1. Ignore all \"Text\" as they don't contribute to the meaning\n2. On every line there will be a type of media and then the coming number are likes, Shares and Comments.\n   Example: live video 223, 86, 63\n   I) 223 are likes for live video \n   II) 86 are shares\n   III) 63 are comments\n\n\nAnswer: "
},
"SplitText-gGMOy": {
  "chunk_overlap": 15,
  "chunk_size": 50,
  "separator": "\\n"
},
"ChatOutput-cqNSS": {
  "background_color": "",
  "chat_icon": "",
  "data_template": "{text}",
  "input_value": "",
  "sender": "Machine",
  "sender_name": "AI",
  "session_id": "",
  "should_store_message": true,
  "text_color": ""
},
"AstraDB-esRXh": {
  "advanced_search_filter": "{}",
  "api_endpoint": "https://fd18c845-3112-4a89-9f0b-cc74e5a915bf-us-east-2.apps.astra.datastax.com",
  "batch_size": null,
  "bulk_delete_concurrency": null,
  "bulk_insert_batch_concurrency": null,
  "bulk_insert_overwrite_concurrency": null,
  "collection_indexing_policy": "",
  "collection_name": "engagement_data_collection",
  "embedding_choice": "Embedding Model",
  "keyspace": "",
  "metadata_indexing_exclude": "",
  "metadata_indexing_include": "",
  "metric": "cosine",
  "number_of_results": 4,
  "pre_delete_collection": false,
  "search_filter": {},
  "search_input": "",
  "search_score_threshold": 0,
  "search_type": "Similarity",
  "setup_mode": "Sync",
  "token": "ASTRA_DB_APPLICATION_TOKEN"
},
"File-BmKZd": {
  "concurrency_multithreading": 4,
  "path": "social_media_data.csv",
  "silent_errors": false,
  "use_multithreading": false
},
"GroqModel-gjX9h": {
  "groq_api_base": "https://api.groq.com",
  "groq_api_key": process.env.GROQ_KEY,
  "input_value": "",
  "max_tokens": null,
  "model_name": "llama-3.1-8b-instant",
  "n": null,
  "stream": false,
  "system_message": "",
  "temperature": 0.1
},
"AstraDB-TSbed": {
  "advanced_search_filter": "{}",
  "api_endpoint": "https://fd18c845-3112-4a89-9f0b-cc74e5a915bf-us-east-2.apps.astra.datastax.com",
  "batch_size": null,
  "bulk_delete_concurrency": null,
  "bulk_insert_batch_concurrency": null,
  "bulk_insert_overwrite_concurrency": null,
  "collection_indexing_policy": "",
  "collection_name": "engagement_data_collection",
  "embedding_choice": "Embedding Model",
  "keyspace": "",
  "metadata_indexing_exclude": "",
  "metadata_indexing_include": "",
  "metric": "cosine",
  "number_of_results": 4,
  "pre_delete_collection": false,
  "search_filter": {},
  "search_input": "",
  "search_score_threshold": 0,
  "search_type": "Similarity",
  "setup_mode": "Sync",
  "token": "ASTRA_DB_APPLICATION_TOKEN"
},
"OpenAIEmbeddings-2olgA": {
  "chunk_size": 1000,
  "client": "",
  "default_headers": {},
  "default_query": {},
  "deployment": "",
  "dimensions": null,
  "embedding_ctx_length": 1536,
  "max_retries": 3,
  "model": "text-embedding-3-small",
  "model_kwargs": {},
  "openai_api_base": "",
  "openai_api_key": process.env.OPENAI_KEY,
  "openai_api_type": "",
  "openai_api_version": "",
  "openai_organization": "",
  "openai_proxy": "",
  "request_timeout": null,
  "show_progress_bar": false,
  "skip_empty": false,
  "tiktoken_enable": true,
  "tiktoken_model_name": ""
},
"OpenAIEmbeddings-rFAyF": {
  "chunk_size": 1000,
  "client": "",
  "default_headers": {},
  "default_query": {},
  "deployment": "",
  "dimensions": null,
  "embedding_ctx_length": 1536,
  "max_retries": 3,
  "model": "text-embedding-3-small",
  "model_kwargs": {},
  "openai_api_base": "",
  "openai_api_key": process.env.OPENAI_KEY,
  "openai_api_type": "",
  "openai_api_version": "",
  "openai_organization": "",
  "openai_proxy": "",
  "request_timeout": null,
  "show_progress_bar": false,
  "skip_empty": false,
  "tiktoken_enable": true,
  "tiktoken_model_name": ""
}
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
        return output.message.text;
        console.log("Final Output:", output.message.text);
    }
  } catch (error) {
    console.error('Main Error', error.message);
  }
}

app.post("/query", async (req, res) => {
  const { inputValue } = req.body;
  // console.log("question:  ", inputValue);

  const args = [inputValue];
  const response = await main(
    args[0], // inputValue
    args[1], // inputType
    args[2], // outputType
    args[3] === "true" // stream
  );

  console.log("args: ", args);
  console.log("response:  ", response);
  return res.status(200).send(response);
});

class LangflowProcessor {
  constructor() {
      // Initialize with your configuration
      this.langflowUrl = process.env.LANGFLOW_INSTANCE_URL;
      this.astraToken = process.env.ASTRA_DB_APPLICATION_TOKEN;
      
      // Store the flow configuration matching your Langflow setup
      this.flowConfig = {
        splitText: {
          name: "SplitText-gGMOy",
          settings: {
              chunk_overlap: 15,
              chunk_size: 50,
              separator: "\n"
          }
        },
        astraDB: {
          name: "AstraDB",
          settings: {
              database: "engagement_db",
              collection: "engagement_data_collection",
              token: this.astraToken
          }
      },
        openai_embeddings: {
          name: "OpenAIEmbeddings-2olgA",
          settings: {
              model: "text-embedding-3-small",
              // This is the component connected after Split Text
              purpose: "data_ingestion"
          }
        }
      };
  }

  async processFile(fileData) {
    try {
        // Step 1: Upload file to Langflow
        // const fileData = await this.uploadFile(filePath);

        // Step 2: Process the file through the text splitter
        // console.log(fileData);
        const chunks = await this.splitText(fileData);
        console.log(chunks);

        // Step 3: Generate embeddings and store in AstraDB
        await this.storeInAstraDB(chunks);

        console.log('Successfully processed file and stored in AstraDB');
    } catch (error) {
        console.error('Error in processing:', error);
        throw error;
    }
  }

  async splitText(fileData) {
    // Process through the text splitter component
    try {
        const response = await axios.post(
            `${this.langflowUrl}/api/v1/process`,
            {
                component: this.flowConfig.splitText.name,
                configs: {
                    chunk_overlap: this.flowConfig.splitText.chunk_overlap,
                    chunk_size: this.flowConfig.splitText.chunk_size,
                    separator: this.flowConfig.splitText.separator
                },
                input: fileData.text
            }
        );
        return response.data.chunks;
    } catch (error) {
        console.error('Error splitting text:', error);
        throw error;
    }
  }

  async storeInAstraDB(chunks) {
    // Process chunks through OpenAI embeddings and store in AstraDB
    try {
        // First generate embeddings
        const embeddingsResponse = await axios.post(
            `${this.langflowUrl}/api/v1/process`,
            {
                component: this.flowConfig.openai_embeddings.name,
                configs: {
                    model: this.flowConfig.openai_embeddings.model
                },
                input: chunks
            }
        );

        // Then store in AstraDB
        const astraResponse = await axios.post(
            `${this.langflowUrl}/api/v1/process`,
            {
                component: "AstraDB",
                configs: {
                    database: this.flowConfig.astra_db.database,
                    collection: this.flowConfig.astra_db.collection,
                    token: this.flowConfig.astra_db.token
                },
                input: {
                    data: chunks,
                    embeddings: embeddingsResponse.data.embeddings
                }
            }
        );
        return astraResponse.data;
    } catch (error) {
        console.error('Error storing in AstraDB:', error);
        throw error;
    }
  }
}

async function uploadFile(file, id) {
  // Create a new Axios instance
  const api = axios.create({
    baseURL: "",
  });
  const formData = new FormData();
  formData.append("file", file);
  console.log('langflow url: ', process.env.LANGFLOW_URL);
  return await api.post(`${process.env.LANGFLOW_URL}/api/v1/files/upload/${id}`, formData);
}


async function langflow_upload(file) {
  // const fileInput = document.getElementById('fileInput');
  if (file.length > 0) {
    // const file = fileInput.files[0];
    const flowId = process.env.LANGFLOW_FLOW_ID; // Replace this with the actual flow ID
    try {
      const response = await uploadFile(file, flowId);
      console.log('File uploaded successfully', response);
      return response;
      // Here you can handle the response, e.g., saving the file path returned by the API
    } catch (error) {
      console.error('Error uploading file:', error.response.data);
    }
  } else {
    console.log('No file selected');
  }
}

// Add this new endpoint for file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log('reached here');

  langflow_upload("this, is, my, file. suck my dick, guys.").then(function (result){
    console.log('reached end of file upload stuff: ', result);

  // console.log("aaaaaaaaaaaaaaaaaaaaahhh: ", );

  const fileContent = req.file.buffer.toString("utf8");
  const collectionName = `social_data_${uuidv4().split("-")[0]}`;

  try {
    // Parse CSV
    const temp_results = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    var results = [];
    for (var i = 0; i < temp_results.data.length; i++) {
      var obj = temp_results.data[i];
      // console.log('obj:', obj);
      if (obj.PostType!=null && obj.Likes!=null && obj.Shares!=null && obj.Comments!=null) {
        results.push(obj);
      }
    }

    // console.log('final results:', results);

    var processor = new LangflowProcessor();
    processor.processFile(results);
    
    res.status(200).json({
      message: "Data uploaded successfully",
      collection: collectionName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});
});

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running at vercel:)`);
  // Connect to Astra DB when server starts
  run().catch(console.error);
});
