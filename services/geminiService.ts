import { GoogleGenAI } from "@google/genai";
import { Bill } from "../types";

/**
 * Generates a professional WhatsApp reminder using Gemini 3 Flash.
 * This function handles the communication between the ERP and the customer.
 */
export const generateReminderMessage = async (bill: Bill): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  // Standard fallback message in case the API call fails or key is missing
  const fallback = `Namaste ${bill.customerName}, this is a reminder from Shree Ganesh Flex & Advertising regarding your pending payment of ₹${bill.totalAmount}. Please settle it at your earliest convenience. Thank you!`;

  if (!apiKey || apiKey === 'undefined') {
    console.warn("API_KEY not found in environment. Using fallback message.");
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We use gemini-3-flash-preview for fast and cost-effective text generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [{
          text: `You are the office assistant at 'Shree Ganesh Flex & Advertising'. 
          Write a polite, professional, yet firm WhatsApp message to a customer.
          
          Details:
          Customer Name: ${bill.customerName}
          Total Due: ₹${bill.totalAmount}
          Work Done: ${bill.items.map(i => i.serviceName).join(', ')}
          
          Instructions: 
          - Use a greeting like 'Namaste'.
          - Be brief and clear.
          - Mention that this is an automated reminder.
          - Encourage early payment for better service.`
        }]
      }],
    });

    // Directly access the .text property from the response
    return response.text || fallback;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return fallback;
  }
};