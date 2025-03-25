//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { ConfigureBot, fetchBots } from "@/app/actions";
import ChatbotConfig from "@/app/components/ChatbotConfig";
import { ChatInterface } from "@/app/components/ChatInterface";


import { useParams } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { Alert } from "@/app/components/Alert";

const BotConfigPage = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [botConfig, setBotConfig] = useState(null);
  const [error, setError] = useState(null);
  const [chatid, setchatid] = useState(null)

  useEffect(() => {
    const loadBotData = async () => {
      try {
        const decodedString = decodeURIComponent(params.id);
        const [id, type] = decodedString.split("&");
setchatid(id);
        const botData = await fetchBots(id, type);

   
        setBotConfig(botData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch bot configuration:", err);
        setError("Could not load bot configuration. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBotData();
  }, [params.id, refreshTrigger]);

  const handleConfigRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white">

        <div className="h-full flex flex-col">
          {/* Header */}
  

    
          

          {/* Main Content */}
          {isLoading ? (
          <div className="flex items-center justify-center h-screen bg-white">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-gray-500">Loading bot configuration...</p>
          </div>
        </div>
        
          ) : error ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="bg-red-50 border border-red-200  rounded-lg p-6 max-w-md">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => setRefreshTrigger((prev) => !prev)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex gap-6 bg-white">
              {/* Left side: Chat Interface (Fixed) */}
              <div className="w-1/2 p-6 ">
                <div className="sticky top-16 h-[calc(100vh-8rem)] pt-3 ">
              
                 {<ChatInterface chatid={chatid} />}
                </div>
              </div>

              {/* Right side: Config Panel (Scrollable) */}
              <div className="w-1/2  -mt-3  bg-white ">
             
                  {botConfig && <ChatbotConfig setrelode={handleConfigRefresh} config={botConfig} />}
              
              </div>
            </div>
          )}
        </div>

    </div>
  );
};

export default BotConfigPage;