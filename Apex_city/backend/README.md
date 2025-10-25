Architecture / Flow

User Query → sent from mobile app to /chat endpoint.

RAG Service (ragService.js):

Fetch complaints from MongoDB.

Embed complaints using Gemini embeddings.

Store in in-memory vector store.

Retrieve top relevant complaints for the query.

Send query + context to Gemini 2.5 Flash Pro.

Gemini Response → returned as JSON to frontend. 






          ┌──────────────┐
          │  Mobile App  │
          └──────┬──────┘
                 │ POST /chat
                 ▼
          ┌──────────────┐
          │  Express     │
          │  Backend     │
          └──────┬──────┘
                 │ calls
                 ▼
         ┌───────────────┐
         │  ragService.js│
         │  - Fetch MongoDB complaints
         │  - Embed using Gemini Embeddings
         │  - Store in MemoryVectorStore
         │  - Retrieve top matches
         │  - Send prompt + context to Gemini
         └──────┬────────┘
                │
                ▼
      ┌─────────────────────┐
      │ Gemini 2.5 Flash Pro │
      └────────┬────────────┘
               │
               ▼
        ┌──────────────┐
        │ JSON Response│
        └──────┬───────┘
               ▼
          ┌──────────────┐
          │ Mobile App   │
          └──────────────┘







          Frontend → /chat route → RAG service → Gemini → /chat route → JSON reply → Frontend
