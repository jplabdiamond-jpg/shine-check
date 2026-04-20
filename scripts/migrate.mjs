// scripts/migrate.mjs
// 実行: node --env-file=.env.local scripts/migrate.mjs

import { Pool, neonConfig } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log("🚀 マイグレーション開始...");
  const client = await pool.connect();
  try {
    const schemaSQL = readFileSync(join(__dirname, "../lib/db/schema.sql"), "utf-8");
    // 全文を一括実行
    await client.query(schemaSQL);
    console.log("✅ マイグレーション完了！");
  } catch (err) {
    console.error("❌ マイグレーション失敗:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
