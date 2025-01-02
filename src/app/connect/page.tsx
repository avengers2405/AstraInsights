'use client'

import { DataAPIClient } from "@datastax/astra-db-ts";

// Initialize the client
const client = new DataAPIClient('AstraCS:SRwwNxxNuyTHxkIsWZgnswmv:ea6c15bdbd1fc2315967dfa78cd088751da051c8a07fd767f7f979394e589e0f');
const db = client.db('https://fd18c845-3112-4a89-9f0b-cc74e5a915bf-us-east-2.apps.astra.datastax.com');

(async () => {
  const colls = await db.listCollections();
  console.log('Connected to AstraDB:', colls);
})();

export default function Connect() {
  return(
    <div>
      <h1>Connect to AstraDB</h1>
      <p>Check the console for connection status</p>
    </div>
  )
}