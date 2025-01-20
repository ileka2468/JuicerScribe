import dotenv from "dotenv";
dotenv.config();

import tmi from "tmi.js";
import amqp from "amqplib";

async function sendMessageToExchange(message) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const exchange = "ChatExchange";

    await channel.assertExchange(exchange, "direct", { durable: true });
    channel.publish(exchange, "twitch", Buffer.from(JSON.stringify(message)));

    console.log("Message sent to RabbitMQ:", message);
    setTimeout(() => connection.close(), 500);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
}

function startTwitchListener() {
  const client = new tmi.Client({
    options: { debug: true },
    channels: [process.env.TWITCH_CHANNEL],
  });

  client.connect();

  client.on("message", (channel, tags, message, self) => {
    if (self) return;

    const chatMessage = {
      platform: "Twitch",
      channel,
      username: tags["display-name"] || "Anonymous",
      message,
      timestamp: new Date(),
    };

    console.log(`${tags["display-name"] || "Anonymous"}: ${message}`);
    sendMessageToExchange(chatMessage);
  });
}

export { startTwitchListener };
