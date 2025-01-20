import dotenv from "dotenv";
dotenv.config();

import { startTwitchListener } from "./twitchProducer.js";
import { startKickListener } from "./kickProducer.js";

async function main() {
  console.log("Starting chat ingestion...");

  startTwitchListener();
  startKickListener();
}

main().catch((error) => {
  console.error("Error starting the application:", error);
  process.exit(1);
});
