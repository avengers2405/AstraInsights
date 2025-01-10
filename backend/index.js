import cassandra from "cassandra-driver";
import express from "express";
import { PORT } from "./config.js";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { DataAPIClient, Collection } from '@datastax/astra-db-ts';
// import pkg from "@datastax/astra-db-ts";
// const { DataAPIClient, createClient } = pkg;
// import { fileTypeFromBuffer } from "file-type";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
var collectionName = "assignment_collection";
var dimension_embedding = 1024;

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const cloud = { secureConnectBundle: "./secure-connect-engagement-db.zip" };
const authProvider = new cassandra.auth.PlainTextAuthProvider(
  "token",
  process.env.LANGFLOW_APPLICATION_TOKEN
);
const client = new cassandra.Client({
  cloud,
  authProvider,
  keyspace: "default_keyspace", // Add your keyspace name here
});

async function run() {
  console.log('going to connect');
  await client.connect();
  console.log("Connected to Astra.");
}

// Create a function to insert data
// async function insertEngagementData(pType, likes, shares, comments) {
//   const query =
//     "INSERT INTO engagement_metrics (id, post_type, likes, shares, comments, created_at) VALUES (uuid(), ?, ?, ?, ?, toTimestamp(now()))";
//   const params = [pType, likes, shares, comments];

//   try {
//     await client.execute(query, params, { prepare: true });
//     return true;
//   } catch (err) {
//     console.error("Error inserting data:", err);
//     return false;
//   }
// }

app.get("/", (req, res) => {
  console.log("connecting to Astra");
  run().catch(console.error);
  return res.status(200).send("Connected to Astra");
});

// app.post("/data", async (req, res) => {
//   const { postType, like, share, comments } = req.body;
//   console.log(req.body);

//   try {
//     // Insert data into Astra DB
//     const success = await insertEngagementData(postType, like, share, comments);

//     if (success) {
//       return res.status(201).json({
//         message: "Data successfully stored in Astra DB",
//         data: { postType, like, share, comments },
//       });
//     } else {
//       return res.status(500).json({
//         message: "Failed to store data in Astra DB",
//       });
//     }
//   } catch (error) {
//     console.error("Error in /data endpoint:", error);
//     return res.status(500).json({
//       message: "Server error while processing data",
//       error: error.message,
//     });
//   }
// });

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
  const flowIdOrName = process.env.LANGFLOW_FLOW_ID;
  const langflowId = process.env.LANGFLOW_ID;
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
  "api_endpoint": process.env.ASTRA_DB_ENDPOINT,
  "batch_size": null,
  "bulk_delete_concurrency": null,
  "bulk_insert_batch_concurrency": null,
  "bulk_insert_overwrite_concurrency": null,
  "collection_indexing_policy": "",
  "collection_name": collectionName,
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
  "api_endpoint": process.env.ASTRA_DB_ENDPOINT,
  "batch_size": null,
  "bulk_delete_concurrency": null,
  "bulk_insert_batch_concurrency": null,
  "bulk_insert_overwrite_concurrency": null,
  "collection_indexing_policy": "",
  "collection_name": collectionName,
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
  "embedding_ctx_length": dimension_embedding,
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
  "embedding_ctx_length": dimension_embedding,
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
console.log('using collection: ', collectionName, ' and dimension: ', dimension_embedding);
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
  var response = await main(
    args[0], // inputValue
    args[1], // inputType
    args[2], // outputType
    args[3] === "true" // stream
  );

  console.log("args: ", args);
  console.log("response:  ", response);
  if (response==undefined){
    collectionName = 'assignment_collection';
    dimension_embedding = 1024;
    console.log('using backup data');
    response = await main(
      args[0], // inputValue
      args[1], // inputType
      args[2], // outputType
      args[3] === "true" // stream
    );
  }
  return res.status(200).send(response);
});

// Add this new endpoint for file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  // Initialize the client and get a 'Db' object
  const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
  const db = client.db(process.env.ASTRA_DB_ENDPOINT);

  console.log(`* Connected to DB ${db.id}`);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileContent = req.file.buffer.toString("utf8");
  const collection_name = `social_data_${uuidv4().split("-")[0]}`;

  try {
    // Parse CSV
    const temp_results = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    const documents = [];
    for (var i = 0; i < temp_results.data.length; i++) {
      var obj = temp_results.data[i];
      // console.log('obj:', obj);
      if (obj.PostType!=null && obj.Likes!=null && obj.Shares!=null && obj.Comments!=null) {
        documents.push({
          PostType: obj.PostType,
          Likes: obj.Likes,
          Shares: obj.Shares,
          Comments: obj.Comments,
          content: `${obj.PostType},${obj.Likes},${obj.Shares},${obj.Comments}`,
          metadata: {
            source: "internet",
            title: "info",
            language: 'english'
          },
          $vectorize: `${obj.PostType},${obj.Likes},${obj.Shares},${obj.Comments}`,
        });
      }
    }

    console.log('Now going for insertion. document prepared: ', documents);

    (async function () {
      const coll = await db.createCollection(collection_name, {
        keyspace: "default_keyspace",
        defaultId: {
          type: "objectId",
        },
        checkExists: false,
        vector: {
          dimension: 1024,
          metric: "cosine",
          service: {
            provider: 'nvidia',
            modelName: 'NV-Embed-QA',
          },
    
        },
      });

      // const admin1 = client.admin(); // admin roles, can be used

      try {
        const inserted = await coll.insertMany(documents);
        console.log(`* Inserted ${inserted.insertedCount} items.`);
        collectionName = collection_name;
        dimension_embedding = 1024;
      } catch (e) {
        console.log("* Documents found on DB already. Let\'s move on!\n Or maybe there's some error FFs");
      }

      // console.log(await admin1.listDatabases());
    })();

    // const astra_client = new Collection({
    //   applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    //   endpoint: process.env.ASTRA_DB_ENDPOINT,
    //   keyspace: 'default_keyspace',
    // });

    // const astra_collection = await astra_client.collection(collection_name);

    // await astra_collection.updateSearchConfig({
    //   vector: {
    //     enabled: true,
    //     dimension: 1536,  // Must match your embedding dimension
    //     metric: "cosine"      // or "euclidean" or "dot_product" based on your needs
    //   }
    // });
    // console.log(`Vector search enabled for collection: ${collection_name}`);
    // const config = await astra_collection.getSearchConfig();
    // console.log("Search config:", config);

    res.status(200).json({
      message: "Data uploaded successfully",
      collection: collectionName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
    // Connect to Astra DB when server starts
    run().catch(console.error);
});
