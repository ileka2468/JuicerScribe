import dotenv from "dotenv";
dotenv.config();

import { startTwitchListener } from "./twitchProducer.js";
import { startKickListener } from "./kickProducer.js";
import { startConsumers } from "./MessageStorageConsumer.js";

async function main() {
  console.log("Starting chat ingestion...");
  startConsumers();
  startTwitchListener();
  startKickListener();
}

main().catch((error) => {
  console.error("Error starting the application:", error);
  process.exit(1);
});
