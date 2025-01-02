import cassandra from 'cassandra-driver';
import express from "express";
import {PORT} from "./config.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

app.use(express.json());
app.use(cors());

const cloud = { secureConnectBundle: './secure-connect-engagement-db.zip' };
const authProvider = new cassandra.auth.PlainTextAuthProvider('token', 'AstraCS:CfxfAtsYKHmZPvYopBhsZUjI:99725dc52c5de3ba4fc4be72d62bae6ceaea2cdab3f5f4241e0772510e3411e6');
const client = new cassandra.Client({ cloud, authProvider });

async function run() {
    await client.connect();

    console.log('Connected to Astra with Keyspace: ', client.metadata.keyspaces);
}

app.get("/", (req, res) => {
    console.log("connecting to Astra");
    run().catch(console.error);
    return res.status(200).send("Connected to Astra");
});

app.post("/data", (req, res) => {
    const {pType, likes, shares, comments} = req.body;
    console.log(req.body); 
    console.log(pType, likes, shares, comments);
    return res.status(200).send("Data received");
})

// run().catch(console.error);