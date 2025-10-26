// services/rag/ragService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "langchain/embeddings/google";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import Complaint from "../../models/Complaint.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let vectorStore;


export async function initRAG() {
  try {
    const complaints = await Complaint.find();
    if (!complaints || complaints.length === 0) {
      console.log(" No complaints found in DB. Using fallback empty data.");
      vectorStore = new MemoryVectorStore();
      return;
    }

    const docs = complaints.map((c) => {
      const text = `
Complaint ID: ${c.complaintId}
Category: ${c.category}
Description: ${c.description}
Status: ${c.status}
Location: ${c.location}
Created At: ${new Date(c.createdAt).toLocaleString()}
      `;
      return new Document({
        pageContent: text,
        metadata: { id: c.complaintId },
      });
    });

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "models/embedding-001",
    });

    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    console.log(` RAG vector index built with ${complaints.length} complaints`);
  } catch (err) {
    console.error("Error initializing RAG store:", err);
  }
}

// Function to get answer from llm based on user prompt 
export async function getChatbotResponse(userQuery) {
  try {
    if (!vectorStore) await initRAG();

    // Retrieve the top 3 semantically similar complaints   - finding similar complaints from vector databse
    const results = await vectorStore.similaritySearch(userQuery, 3);
    const context =
      results.map((r) => r.pageContent).join("\n\n") || "No related data found.";

    
    const prompt = `
You are "LocalPulse AI Assistant" — a helpful civic chatbot.
You help citizens report and track civic issues like potholes, garbage, and broken streetlights.

You can:
1. Check the status of user complaints.
2. Share information about nearby or resolved issues.
3. Guide users on how to create a new report.

Use the data below if relevant. Be polite, concise, and helpful.

Context:
${context}

User Query:
"${userQuery}"

Answer:
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-pro" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return reply;
  } catch (err) {
    console.error(" Error in getChatbotResponse:", err);
    return "Sorry, I’m having trouble fetching the details right now.";
  }
}
