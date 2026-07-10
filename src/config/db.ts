import { Pool } from "pg";

const dbPool = new Pool({
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  max: 20,
  connectionTimeoutMillis: 2000,
});

export default dbPool;
