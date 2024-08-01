import { FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import * as fs from "fs";
async function globalSetup(config: FullConfig) {
  try {
    const envFilePath = process.env.ENV ? `.env.${process.env.ENV}` : ".env";
    if (fs.existsSync(envFilePath)) {
      dotenv.config({
        path: envFilePath,
        override: true,
      });
    } else {
      console.warn(
        `Environment file ${envFilePath} not found. Falling back to default .env file.`
      );
      dotenv.config({
        path: ".env",
        override: true,
      });
    }
  } catch (error) {
    console.error("Error in loading environment variables", error);
  }
}
export default globalSetup;
