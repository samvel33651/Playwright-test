import { FullConfig } from "@playwright/test";
import * as dotenv from "dotenv";
async function globalSetup(config: FullConfig) {
  try {
    console.log("here", process.env.ENV);
    if (process.env.ENV) {
      dotenv.config({
        path: `.env.${process.env.ENV}`,
        override: true,
      });
    }
  } catch (error) {
    console.error("Error in loading environment variables", error);
  }
}
export default globalSetup;
