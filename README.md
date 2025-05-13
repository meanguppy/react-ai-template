# React AI Starter Template

This is a NextJS project that has a MongoDB backend with an OpenAI embeddings and API hooked up to kickstart an AI application. It uses `bun`, QDrant, MongoDB, NodeJS, Typescript, and Next 15.3.2 (latest at time of writing).

## Getting Started

1. `bun install` ([Link to install](https://bun.sh/docs/installation))
2. Make sure mongo is running on `mongodb://localhost:27017` by running `mongod` ([Link to install](https://www.mongodb.com/docs/manual/installation/))
3. Make sure QDrant is running on `localhost:6333` ([Docker container instructions](https://github.com/qdrant/qdrant-js?tab=readme-ov-file#usage))
4. Replace OpenAI API key with your own, change `env.example` to `.env`
5. Run `npx tsx scripts/seed.ts` to seed your databases (Mongo + Qdrant)
6. 
