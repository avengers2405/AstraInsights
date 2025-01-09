// 'use client'

import axios from 'axios';
// import dotenv from "dotenv";

// dotenv.config();

async function connect() {
  try {
    console.log('Connecting to AstraDB...');
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`);
    console.log('Connected to AstraDB');
  } catch (error) {
    console.error('Error connecting to AstraDB', error);
  }
}

export default function Connect() {

  connect();

  return(
    <div>
      <h1>Connect to AstraDB</h1>
      <p>Check the console for connection status</p>
    </div>
  )
}
