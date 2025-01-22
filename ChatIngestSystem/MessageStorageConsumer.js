import amqp from "amqplib";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT, 10),
  ssl: true,
});

// Function to store messages in the PostgreSQL database
async function storeMessage({
  platform,
  username,
  message: content,
  timestamp,
  channel,
}) {
  try {
    // Check if the user exists
    const userResult = await pool.query(
      `INSERT INTO users (username, platform_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (platform_id)
       DO UPDATE SET username = EXCLUDED.username
       RETURNING id`,
      [username, `${platform}_${username}`, "Viewer"]
    );

    const userId = userResult.rows[0].id;

    // Check if a stream exists
    const streamResult = await pool.query(
      `SELECT id FROM streams
       WHERE platform = $1 AND channel = $2
       ORDER BY start_time DESC
       LIMIT 1`,
      [platform, channel.replace("#", "")]
    );

    if (streamResult.rows.length === 0) {
      throw new Error(
        `No active stream found for ${platform} on channel ${channel}`
      );
    }

    const streamId = streamResult.rows[0].id;

    // Insert message
    await pool.query(
      `INSERT INTO messages (stream_id, user_id, content, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [streamId, userId, content, new Date(timestamp)]
    );

    console.log("Message stored successfully:", {
      platform,
      username,
      content,
    });
  } catch (error) {
    console.error("Error storing message:", error.message);
  }
}

// Function to consume messages from a specific queue
async function consumeMessages(queueName) {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true,
      arguments: { "x-message-ttl": 900000 }, // (15 minutes)
    });

    console.log(`Listening for messages on queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          await storeMessage(message);
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error.message);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error(
      `Error consuming messages from queue ${queueName}:`,
      error.message
    );
  }
}

function startConsumers() {
  consumeMessages("KickQueue");
  consumeMessages("TwitchQueue");
}

export { startConsumers };
