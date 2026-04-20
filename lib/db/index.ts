import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };

// 汎用クエリヘルパー
export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  try {
    const result = await sql(strings, ...values);
    return result as T[];
  } catch (err) {
    console.error("[DB Error]", err);
    throw err;
  }
}
