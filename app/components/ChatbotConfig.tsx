//@ts-nocheck
"use client"
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Bot, MessageSquare, Calendar, Plus, Minus, Settings, Info, ChevronDown } from 'lucide-react';
import { ConfigureBot } from '@/app/actions';
import { toast } from 'sonner';
import SpinningIcon from './ui/SpinningIcon';
import { useRouter } from 'next/navigation';
interface EnrichmentQuestion {
  id: string;
  question: string;
}

export interface Chatbotconfig {
  id:string
  botName: string;
  leadType: 'buyer' | 'seller';
  startingMessage: string;
  enrichmentQuestions: EnrichmentQuestion[];
  enableAppointmentSetter: boolean;
  bussinessinfo: string;
}

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => (
  <div className="group relative inline-block">
    <Info className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-sm rounded-lg py-2 px-3 absolute z-10 -right-4 top-full mt-2 w-64 pointer-events-none">
      <div className="absolute -top-1 right-[20px] w-2 h-2 bg-gray-900 transform rotate-45" />
      {content}
    </div>
  </div>
);

export default function ChatbotConfig({ setrelode, config,setclose }) {
  const [loader, setloader] = useState(false);
  const [isLeadTypeOpen, setIsLeadTypeOpen] = useState(false);
  
  // Initialize with default or config data
  const [enrichmentQuestions, setEnrichmentQuestions] = useState<EnrichmentQuestion[]>(() => {
    if (config && config.enrichment && config.enrichment.length > 0) {
      return config.enrichment.map(q => ({ 
        id: q.id || Date.now().toString(), 
        question: q.question || '' 
      }));
    }
    return [{ id: '1', question: '' }];
  });
const router=useRouter();
  const { register, handleSubmit, watch, setValue, getValues } = useForm<Chatbotconfig>({
    defaultValues: {
      leadType: 'seller',
      ...(config ? {
        id:config.id,
        botName: config.name,
        startingMessage: config.startingmessage,
        enableAppointmentSetter: config.appointmentsetter,
        bussinessinfo: config.bussinessinfo
      } : {})
    }
  });

  // Set enrichment questions in form values when component mounts
  useEffect(() => {
    if (enrichmentQuestions.length > 0) {
      enrichmentQuestions.forEach((question, index) => {
        setValue(`enrichmentQuestions.${index}`, question);
      });
    }
  }, []);

  const currentLeadType = watch('leadType');

  const addEnrichmentQuestion = () => {
    const newQuestion = { id: Date.now().toString(), question: '' };
  
    setEnrichmentQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions, newQuestion];
      
      // Use the question ID as the key instead of index
      setValue(`enrichmentQuestions.${newQuestion.id}`, newQuestion);
  
      return updatedQuestions;
    });
  };
  


  const removeEnrichmentQuestion = (id: string) => {
    setEnrichmentQuestions((prevQuestions) => {
      const updatedQuestions = prevQuestions.filter((q) => q.id !== id);
  
      // Remove the specific question from the form
      setValue(`enrichmentQuestions.${id}`, undefined);
  
      return updatedQuestions;
    });
  };
  const onSubmit = async (data: Chatbotconfig) => {
    setloader(true);
    
    // Ensure enrichmentQuestions is properly set in the datae
    data.enrichmentQuestions = enrichmentQuestions;
    
    const createbot = await ConfigureBot(data);
      console.log(createbot,createbot);

    window.location.reload();
    if (createbot?.error) {
      toast(createbot?.error);
    }
    if (createbot?.success) {
      setrelode(prev => !prev);
  
      toast('Bot created successfully');
    }
    setloader(false);
  };

  return (
    <div className="min-h-screen bg-white   sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Configure Your Chatbot</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700">Bot Name<div className='text-sm'></div></label>
                  <Tooltip content="This name will be used by the AI to introduce itself to users. Choose a friendly, professional name that aligns with your brand. For example, if your bot is named 'Alex', it might say 'Hi, I'm Alex, your real estate assistant.'" />
                </div>
                <input
                  type="text"
                  {...register('botName')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="Enter bot name"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700">Lead Type<div className='text-sm'>(dont work)</div></label>
                  <Tooltip content="This setting fundamentally changes how the AI interacts with leads. For buyers, it focuses on property features, neighborhoods, and viewing appointments. For sellers, it emphasizes property valuation, market analysis, and listing strategies." />
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLeadTypeOpen(!isLeadTypeOpen)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <span className="capitalize">{currentLeadType} Lead</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isLeadTypeOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isLeadTypeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                      >
                        {['buyer', 'seller'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setValue('leadType', type as 'buyer' | 'seller');
                              setIsLeadTypeOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left capitalize hover:bg-gray-50 transition-colors ${
                              currentLeadType === type ? 'bg-gray-50' : ''
                            }`}
                          >
                            {type} Lead
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700">Starting Message <div className='text-sm'></div></label>
                  <Tooltip content="This is the AI's opening message. It should be welcoming and set clear expectations. The AI will use this to start conversations, incorporating the bot name and adapting the tone based on the lead type selected." />
                </div>
                <textarea
                  {...register('startingMessage')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  rows={3}
                  placeholder="Example: Hi, I'm [Bot Name] from RealTechEstate! Are you currently looking to buy a property?"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700">Enrichment Questions<div className='text-sm'></div></label>
                  <div className="flex items-center space-x-4">
                    <Tooltip content="These questions help the AI gather crucial information about leads. For buyers, consider questions about preferred locations, budget, or property type. For sellers, focus on property details, timeline, and motivation for selling. The AI will naturally weave these questions into the conversation." />
                    <button
                      type="button"
                      onClick={addEnrichmentQuestion}
                      className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>
                {enrichmentQuestions.map((question, index) => (
  <motion.div
    key={question.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex space-x-2"
  >
    <input
      type="text"
      value={question.question}
      onChange={(e) => {
        setEnrichmentQuestions((prevQuestions) => {
          return prevQuestions.map((q, i) =>
            i === index ? { ...q, question: e.target.value } : q
          );
        });
      }}
      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
      placeholder="Enter your question"
    />

    {enrichmentQuestions.length > 1 && (
      <button
        type="button"
        onClick={() => removeEnrichmentQuestion(question.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Minus className="h-5 w-5" />
      </button>
    )}
  </motion.div>
))}
              </div>

              <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <label className="text-lg font-medium text-gray-700">Enable Appointment Setter<div className='text-sm'>(dont work)</div></label>
                    <p className="text-sm text-gray-500 mt-1">Allow the AI to schedule appointments with leads</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Tooltip content="When enabled, the AI will identify opportunities to schedule appointments with qualified leads. For buyers, it will suggest property viewings. For sellers, it will arrange property valuation meetings." />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('enableAppointmentSetter')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-medium text-gray-700">Common Business info<div className='text-sm'></div></label>
                  <div className="flex items-center space-x-4">
                    <Tooltip content="These questions train the AI on your business specifics. Add frequently asked questions about your services, processes, or policies. The AI will use these to provide accurate, consistent responses aligned with your business practices." />
                  </div>
                </div>
                <textarea
                  {...register('bussinessinfo')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  rows={3}
                  placeholder="Example: Hi, I'm [Bot Name] from RealTechEstate! Are you currently looking to buy a property?"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-6 border-t border-gray-100"
            >
              <button
                disabled={loader}
                type="submit"
                className="px-6 py-3 cursor-pointer bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center space-x-2 text-base font-medium"
              >
                {loader ? 
                  <SpinningIcon>
                    <Settings className="h-5 w-5" />
                  </SpinningIcon> : 
                  <Settings className="h-5 w-5" />
                }
                <span>Save Configuration</span>
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}