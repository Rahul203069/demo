//@ts-nocheck
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import { SendMessage } from '@/app/actions';
import { Alert } from './Alert';

interface Message {
  id: String;
  text: String;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function ChatInterface({chatid}) {
    const params = useParams();
        const decodedString = decodeURIComponent(params.id);
        const [id, type] = decodedString.split("&");
      const [messages, setMessages] = useState<Message[]>([]);
      const [inputValue, setInputValue] = useState("");
      const messagesEndRef = useRef<HTMLDivElement>(null);
      const inputRef = useRef<HTMLInputElement>(null);
      const chatContainerRef = useRef<HTMLDivElement>(null);
    
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      };
      useEffect(() => {
        scrollToBottom();
      }, [messages]);
    
  
    
    
  
    
    
    
      const handleSend = async(e: React.FormEvent) => {
        e.preventDefault();
    
        const newMessages = [...messages, {
            id: Math.random().toString(), 
            sender: 'user', 
            text: inputValue, 
            timestamp: new Date()
        }];
    
        // Set the new messages state
        setMessages(newMessages);
    const res=await SendMessage(newMessages,chatid)
    const me=messages.push({id:Math.random().toString(),sender:'assistant',text:res.content,timestamp:new Date()});
    setMessages(prev => [...prev, {id: Math.random().toString(), sender: 'assistant', text: res?.content, timestamp: new Date()}])
    
      };
    

  return (<>
  <div className='text-red-700 absolute -top-10'>this is still in devlopment so error may occur </div>
  <div className='border p-2 rounded-lg text-b'>You can start the converstaion by send "start"  as message</div>
    <div className="flex flex-col border h-[600px] w-full max-w-md mx-auto bg-gray-100 rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3   bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <h2 className="text-base font-medium">Real Estate SMS</h2>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={chatContainerRef} className=" flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showTimestamp = !prevMessage || 
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000;
            
            return (
                <div key={message.id} className="space-y-1">
              {showTimestamp && (
                  <div className="flex justify-center">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {message.timestamp.toLocaleString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    })}
                  </span>
                </div>
              )}
              <div
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm'
                    } shadow-sm`}
                    >
                  <p className="text-sm leading-5">{message.text}</p>
                  <div className={`text-[10px] mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message"
            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
            </>
  );
}