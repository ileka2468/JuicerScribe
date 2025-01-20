import { createClient } from "@retconned/kick-js";
import amqp from "amqplib";
import "dotenv/config";

async function sendMessageToExchange(message) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const exchange = "ChatExchange";

    await channel.assertExchange(exchange, "direct", { durable: true });
    channel.publish(exchange, "kick", Buffer.from(JSON.stringify(message)));

    console.log("Message sent to RabbitMQ:", message);
    setTimeout(() => connection.close(), 500);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
}

function startKickListener() {
  const client = createClient(process.env.KICK_CHANNEL, {
    logger: true,
    readOnly: true, // read-only connection
  });

  client.on("ready", () => {
    console.log(`Connected to Kick chat for ${process.env.KICK_CHANNEL}`);
  });

  client.on("ChatMessage", (message) => {
    const chatMessage = {
      platform: "Kick",
      channel: process.env.KICK_CHANNEL,
      username: message.sender?.username || "Anonymous",
      message: message.content,
      timestamp: new Date(),
    };

    console.log(
      `${message.sender?.username || "Anonymous"}: ${message.content}`
    );
    sendMessageToExchange(chatMessage);
  });
}

export { startKickListener };
