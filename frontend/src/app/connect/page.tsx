// 'use client'

import axios from 'axios';

async function connect() {
  try {
    console.log('Connecting to AstraDB...');
    const res = await axios.get('http://localhost:5000/');
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