import { config } from "dotenv";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { OpenAI } from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
import path from "path";

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const qdrant = new QdrantClient({ url: process.env.QDRANT_URI! });

async function run() {
  const client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();
  const db = client.db(process.env.DB_NAME);
  const collection = db.collection(process.env.COLLECTION_NAME!);

  const data = JSON.parse(
    readFileSync(path.resolve(__dirname, "./data.json"), "utf-8")
  );

  try {
    await qdrant.getCollection(process.env.QDRANT_COLLECTION_NAME!);
  } catch {
    await qdrant.createCollection(process.env.QDRANT_COLLECTION_NAME!, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }

  for (const doc of data) {
    const id = uuidv4();
    const content = `${doc.title}\n\n${doc.body}`;
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });

    const vector = embedding.data[0].embedding;

    await collection.insertOne({ ...doc, qdrant_id: id });

    await qdrant.upsert(process.env.QDRANT_COLLECTION_NAME!, {
      points: [
        {
          id,
          vector,
          payload: {
            department: doc.department,
            doc_type: doc.doc_type,
          },
        },
      ],
    });
  }

  console.log("✅ MongoDB and Qdrant seeded.");
  await client.close();
}

run();
