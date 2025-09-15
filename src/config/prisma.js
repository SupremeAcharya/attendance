import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();   // try connecting to DB
    console.log("✅ Connected to database");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
  }
}

testConnection();  // call it immediately

export default prisma;
