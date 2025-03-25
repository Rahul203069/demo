//@ts-nocheck

"use server"

import { error } from 'console';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio'
import { Anthropic } from '@anthropic-ai/sdk';



import { GoogleGenerativeAI } from '@google/generative-ai';



import { ReceiptEuro, Truck } from 'lucide-react';



import { response } from 'express';


const anthropic = new Anthropic({
  apiKey:process.env.AI,
});



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;



const prisma=new PrismaClient()




function extractResponse(text) {
  const match = text.match(/<response>([\s\S]*?)<\/response>/);
  return match ? match[1].trim() : null;
}

function extractClassification(text) {
  const match = text.match(/Classification:\s*(.*)/);
  return match ? match[1].trim() : null;
}

function extractReason(text) {
  const match = text.match(/Reason:\s*([\s\S]*)<\/lead_classification>/);
  return match ? match[1].trim() : null;
}






















    
async function GenrertatPrompt(bot:any,type:string){


  const prompt=`Youre name is ${bot.name} and you are an real estate agent who act as a professional real estate agent. Your primary goal is to engage with potential clients, gather information about their property, and qualify leads. Here's how you should conduct the conversation:
  
  1. Begin each interaction with a friendly greeting and introduce yourself as a real estate agent. and ask whether the perosn in intrested in selling his property
  
  2. Throughout the conversation, maintain a natural, human-like tone. Avoid asking questions in a robotic or list-like manner. Instead, weave questions into the conversation naturally.
  
  3. Your main objective is to determine if the person is interested in selling their property. If they are, proceed to gather more information. If not, politely end the conversation.
  
  4. When asking for property details, phrase your questions indirectly. For example, instead of asking "How many bedrooms and bathrooms does your property have?", say something like "It would be really helpful if you could share the number of bedrooms and bathrooms. This information helps us find the right buyers for your property."
  
  5. Try to gather the following information about the property:
     ${bot.enrichment.map((item,index)=>{return  ` .${index} ${item.question},`})}
  
  6. If the person provides all the necessary information, ask if they would be interested in scheduling an appointment on phone call.
  7. if the user shows interest in the appointment than be  consise  with your response
  8. Based on the conversation, classify the lead as follows:
     - Hot: If the person is interested in selling, provides all requested information, and agrees to an appointment.
     - Warm: If the person is interested in selling but is hesitant about providing all information or scheduling an appointment.
     - Junk: If the person is not interested in selling or is clearly not a serious prospect.
  
  9. End the conversation politely, thanking them for their time.
  10. ask  only one question at a time
11. give great reasoning for each question you ask

  12. if the person is not interested in selling the property, end the conversation politely.


  
13. you have to always start the conversation with following message
   <StartingMessage>
   
   
   
   ${bot.startingmessage}
   
   </StartingMessage>
14. following is the info regarding our realestate buissness , refer the following info if the user ask some question regarding the bussiness 

<BussinessInfo>
${bot.bussinessinfo }
</BussinessInfo>

  <user_input>
  {{USER_INPUT}}
  </user_input>
  
  Provide your response in the following format:
  
  <response>
  [Your conversation with the potential client goes here]
  </response>
  
  <lead_classification>
  Classification: [Hot/Warm/Junk]
  Reason: [a little detailed explanation of details you gathered from the lead]
  </lead_classification>`
  
  
  try{
  
    
    if(type==='seller'){
      const bo=await prisma.sellerBot.update({where:{id:bot.id},data:{prompt}})
      console.log(bo)
    }
    
    else{
      
      const bo= await prisma.buyerBot.update({where:{id:bot.id},data:{prompt}})
      console.log(bo)
    }
    
  }catch(e){
  
  console.log(e)
  return e
    
  }
  
  
  
  
  
      }
  



        export  async function ConfigureBot(BotConfigs:ChatbotConfig) {
console.log(BotConfigs,'bot config');



//   const session = await getServerSession(authOptions)
//   if(!session?.user?.id){
//     return
//   redirect('/login');
  
// }
// const user =  await prisma.user.findFirst({where:{id:session?.user.id}}) 


// if(!user){
//   return redirect('/login')
// }



const existingBot=await prisma.sellerBot.findFirst({where:{id:BotConfigs.id},include:{enrichment:true}})

console.log(existingBot,'existing bot')

const existingQuestions = existingBot.enrichment.map(e => e.question);
const existingQuestionMap: { [key: string]: string } = existingBot.enrichment.reduce((map, e) => {
  map[e.question] = e.id;
  return map;
}, {});

// Get new questions from the config
const newQuestions = BotConfigs.enrichmentQuestions.map(q => q.question);

// Find questions to add (ones in the new set but not in existing set)
const questionsToAdd = newQuestions.filter(q => !existingQuestions.includes(q));
console.log(questionsToAdd,'questions to add')
// Find questions to remove (ones in the existing set but not in new set)
const questionsToRemove = existingQuestions
  .filter(q => !newQuestions.includes(q))
  .map(q => existingQuestionMap[q]);
try{

  // Update the bot with complete enrichment management
  const bot = await prisma.sellerBot.update({
    where: { id: BotConfigs.id },
    data: {
      appointmentsetter: BotConfigs.enableAppointmentSetter,
      name: BotConfigs.botName,
      bussinessinfo: BotConfigs.bussinessinfo,
      enrichment: {
        // Delete all enrichment questions that are no longer in the new set
        deleteMany: questionsToRemove.length > 0 
        ? { id: { in: questionsToRemove } }
        : undefined,
        // Only create questions that don't already exist
        create: questionsToAdd.map(question => ({ question }))
      },
      startingmessage: BotConfigs.startingMessage,
    
    },
    include:{enrichment:true}
  });
  await GenrertatPrompt(bot,'seller')
  console.log(bot)
  

return {success:true}
}catch(e){
  console.log(e)
  return {error:'something went wrong'}
}
  
// Log the changes for monitoring
console.log(`Added ${questionsToAdd.length} new questions and removed ${questionsToRemove.length} old questions`);
  // }
  
  // const bot = await prisma.sellerBot.create({
  //   data:{
  //     appointmentsetter:BotConfigs.enableAppointmentSetter,
  //     name:BotConfigs.botName,
  //     bussinessinfo:BotConfigs.bussinessinfo,
  //     enrichment: {  create: BotConfigs.enrichmentQuestions.map((q) => ({
  //       question: q.question,
  //     }))},
  //     startingmessage:BotConfigs.startingMessage,
  //     userid:user.id,
      
  //   },
  //   include:{enrichment:true}
  // })
  







        }



        export async function fetchBots(id:string,type:string) {
 
         

try{

console.log(id,type)



if(type&&type.toLowerCase().includes('seller')){
  const bot =await prisma.sellerBot.findUnique({where:{
    id,
  },

include:{enrichment:true}})
console.log(bot,'bot')

return bot

}


if(type&&type.toLowerCase().includes('buyer')){
  const bot =await prisma.buyerBot.findUnique({where:{
    id,
  },
include:{enrichment:true}
})



console.log(bot,'bot')
return bot
}






          
        }catch(e){
          console.log(e)
          return{error:'something went wrong'+e}
        }


      }





export   async function IntiateTestchat(botid:string,type:string){

try{
  console.log(botid,type,'gjhvjhvjhvukvtfhvytfvutfjhvtg')

  const user = await getuser();
  if(!user){
    return {error:'cnat fetrch uer detail try loigin in again'}
  }


  const chatexist=await prisma.testchat.findFirst({where:{userid:user.id,...(type === 'buyer' ? { buyerbotid: botid } : { sellerbotid: botid })}})

  if(chatexist){
    return chatexist
  }

 const newtestchat =  await prisma.testchat.create({data:{

userid:user.id,
type,

...(type === 'buyer' ? { buyerbotid: botid } : { sellerbotid: botid })


 }}) 

 console.log(chatexist,'chat exist')
  
  
}catch(e){

  console.log(e);
  return{error:`sorry cnat intiate the chat `}
}


    } 



  

    export async function  SendMessage(message:{role:'user'|'assistant',content:string},testchatid:string){



try{

  console.log(message,testchatid)





const botid=testchatid


let prompt:string=''

  
  const bot= await prisma.sellerBot.findUnique({where:{id:botid}})
   prompt=bot.prompt||''
 









  console.log(message,'message');

  const response= await generateGemniChatResponse({ messages: [ ...(message.map((item)=>{return({ role:item.sender,content:item.text})}))],systemPrompt:prompt})

  
  

  

  
  return {role:'assistant', content:response.message}
  
  


}catch(e){

console.log(e);

  return null;
}

    } 


    export interface Message {
      role: 'user' | 'model';
      content: string;
    }
    
    export interface ChatRequest {
      messages: Message[];
      systemPrompt?: string;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    export async function generateGemniChatResponse(chatRequest: ChatRequest) {


console.log(chatRequest,'chat request');

      try {
        // Validate the API key
        if (!process.env.GOOGLE_API_KEY) {
          throw new Error('Missing Google API key. Please add it to your environment variables.');
        }

        console.log(chatRequest.messages,'history');
        const respons = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens:  300,
          temperature:0.8,
          system:chatRequest.systemPrompt,
          messages: [...chatRequest.messages]
        });
        console.log(respons,'response');
        // Get the model (Gemini Pro is used for chat)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' , generationConfig:{maxOutputTokens:1000,temperature:0.8},systemInstruction:chatRequest.systemPrompt});
    
        // Format the chat history for Gemini API
        const history = chatRequest.messages.map(msg => ({
          role:msg.role==='user'?'user':'model',
          parts: [{ text: msg.content }],
        }));
    
        // Remove the last user message to send as the prompt
        
        const formattedHistory = history
        const userMessage =  history.pop();
    console.log(formattedHistory,'formatted history');
    console.log(userMessage,'user message');
        // Create a chat session
        const chat = model.startChat({
          history: [ ...history]
                 
        });
    
        // Send the message and get the response
        const result = await chat.sendMessage(userMessage?.parts[0].text || '');
console.log(result.response.candidates[0].content.parts[0],'resultjhbjhfbvajhf');
        // Return the Gemini response
        
        return { 
          success: true, 
          message: extractResponse(respons.content[0].text) || respons.content[0].text?.split('</response>')[0] || 'No response generated',
        };
      } catch (error: any) {
        console.error('Error generating chat response:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to generate response' 
        };
      }
    }




