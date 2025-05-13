import { NextRequest, NextResponse } from "next/server";
import { config } from "dotenv";
import { MongoClient } from "mongodb";
import { OpenAI } from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const qdrant = new QdrantClient({ url: process.env.QDRANT_URI });

export async function POST(request: NextRequest) {
  const client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const collection = db.collection(process.env.COLLECTION_NAME!);
  const { query }: { query: string } = await request.json();

  const embedRes = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const vector = embedRes.data[0].embedding;

  const result = await qdrant.search(process.env.QDRANT_COLLECTION_NAME!, {
    vector,
    limit: 3,
    filter: {
      must: [
        { key: "department", match: { value: "HR" } },
        { key: "doc_type", match: { value: "policy" } },
      ],
    },
  });

  const ids = result.map((r) => r.id.toString());
  const docs = await collection.find({ qdrant_id: { $in: ids } }).toArray();
  const context = docs.map((d) => d.body).join("\n\n");

  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful HR assistant." },
      {
        role: "user",
        content: `Answer this based on the context:\n\n${context}\n\nQuestion: ${query}`,
      },
    ],
  });

  await client.close();

  return NextResponse.json({ response: chatRes.choices[0].message.content });
}
