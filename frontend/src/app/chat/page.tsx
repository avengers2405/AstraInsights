'use client'

import React, { useState, useEffect } from 'react';
import { Menu, Plus, Search, Edit, ChevronDown, Image, Camera, MessageCircle, Lightbulb, MoreHorizontal, Mic, Link, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// import dotenv from "dotenv";

// dotenv.config({path: '../../.env'});

interface Message {
    text: string;
    sender: string;
  }

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]); 
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", timestamp: "Today", active: true },
  ]);
  const [querySent, setQuerySent] = useState(false);

  useEffect(() => {
    if (querySent) {
        handleQuery();
    }
  }, [querySent]);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      timestamp: "Today",
      active: true
    };
    // Set all other chats to inactive
    const updatedChats = chats.map(chat => ({ ...chat, active: false }));
    setChats([newChat, ...updatedChats]);
    setMessages([]); // Clear messages for new chat
    setInputText(''); // Clear input
  };

  const handleChatSelect = (selectedId: any) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      active: chat.id === selectedId
    }));
    setChats(updatedChats);
    setMessages([]); // In a real app, you'd load the selected chat's messages
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, sender: 'user' }]);
      setQuerySent(true);
      
      // Update the title of the active chat if it's the first message
      const activeChat = chats.find(chat => chat.active);
      if (activeChat && activeChat.title === "New Chat") {
        const updatedChats = chats.map(chat => 
          chat.active ? { ...chat, title: inputText.slice(0, 30) } : chat
        );
        setChats(updatedChats);
      }
    }
  };

  const handleQuery = async () => {
    console.log(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query`);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query`, {inputValue: inputText});
    setMessages([...messages, { text: response.data, sender: 'bot' }]);
    setInputText(''); // Clear input field
    // setOutputValue(response.data);
    setQuerySent(false);
  }

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Sidebar with independent scroll */}
      <div className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 flex flex-col bg-[#f5f5f5] border-r border-gray-200`}>
        <div className="p-2 flex-shrink-0">
          {/* Fixed Header */}
          <Button variant="outline" className="w-full justify-between mb-4 text-gray-600 rounded-xl">
            <span>ChatGPT</span>
            <ChevronDown size={16} />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 rounded-xl hover:bg-gray-200"
            onClick={handleNewChat}
          >
            <Plus size={16} />
            <span>New chat</span>
          </Button>
        </div>

        {/* Scrollable chat list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1">Today</div>
            {chats.map(chat => (
              <Button 
                key={chat.id} 
                variant="ghost" 
                className={`w-full justify-start text-sm py-6 px-2 rounded-xl 
                  ${chat.active ? 'bg-gray-300' : ''}
                  hover:bg-gray-400`}
                onClick={() => handleChatSelect(chat.id)}
              >
                {chat.title}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with independent scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-gray-200 p-2 flex items-center flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 8C3 7.44772 3.44772 7 4 7H20C20.5523 7 21 7.44772 21 8C21 8.55228 20.5523 9 20 9H4C3.44772 9 3 8.55228 3 8ZM3 16C3 15.4477 3.44772 15 4 15H20C20.5523 15 21 15.4477 21 16C21 16.5523 20.5523 17 20 17H4C3.44772 17 3 16.5523 3 16Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </div>

        {/* Scrollable Message Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-3xl font-semibold text-gray-800">
                What can I help with?
              </div>
            </div>
          ) : (
            <div className="p-4">
              {messages.map((message, index) => (
                <div key={index} className="mb-4 w-4/5 m-auto">
                  <div className="p-4 rounded-xl bg-gray-100">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <div className="p-4 max-w-3xl mx-auto w-full flex-shrink-0">
          <div className="relative">
            <div className="border rounded-xl bg-[#f5f5f5] shadow-sm p-2 flex items-end">
              <textarea
                className="flex-1 min-h-[20px] max-h-[200px] p-2 bg-transparent outline-none resize-none"
                placeholder="Ask anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                disabled={querySent}
                style={{color: querySent ? 'gray' : 'black',
                    cursor: querySent ? 'not-allowed' : 'auto'
                }}
              />
              <div className="flex items-center gap-2 p-2">
                <Button variant="ghost" size="icon" className="text-gray-400 rounded-xl">
                  <Link size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 rounded-xl">
                  <Mic size={20} />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-xl transition-all duration-200 ease-in-out
                    ${inputText.trim() ? 'text-gray-800 hover:bg-gray-200' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Send size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" className="gap-2 rounded-xl">
              <Image size={16} />
              Create image
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Camera size={16} />
              Analyze images
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl">
              <MessageCircle size={16} />
              Get advice
            </Button>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Lightbulb size={16} />
              Brainstorm
            </Button>
            <Button variant="outline" className="rounded-xl">
              <MoreHorizontal size={16} />
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
