'use client'

import axios from 'axios';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const App = () => {
    const [inputValue, setInputValue] = useState('');
    const [outputValue, setOutputValue] = useState('');
    
    const handleKeyPress = async (event:any) => {
    if (event.key === 'Enter') {
        const response = await axios.post('http://localhost:5000/query', {inputValue: inputValue});
        console.log("response: ", response);
        setOutputValue(response.data);
        setInputValue(''); // Clear input field
    }
    };

    return (
    <div>
        <div>
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type something and press Enter"
        />
        </div>
        <div>
        <p><ReactMarkdown>{outputValue}</ReactMarkdown></p>
        </div>
    </div>
    );
};

export default App;