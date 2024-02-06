const axios = require("axios");
const amqplib = require("amqplib");
const { pool } = require("./db");
require("dotenv").config();

let ampqChannel;

const queue = "stock-events";
const sendNotification = async (userId, symbol, price) => {
  const tokenResult = await pool.query(
    "select device_token from users where id=$1",
    [userId]
  );
  const deviceToken = tokenResult.rows[0].device_token;
  const response = await axios.post(
    "https://fcm.googleapis.com/fcm/send",
    { to: deviceToken, notification: { title: `${symbol} is at \$${price}!` } },
    {
      headers: {
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
    }
  );
  console.log(response);
};

(async () => {
  const ampqConnection = await amqplib.connect("amqp://localhost");
  ampqChannel = await ampqConnection.createChannel();
  await ampqChannel.assertQueue(queue);
  ampqChannel.consume(queue, (msg) => {
    if (msg !== null) {
      const { userId, symbol, price } = JSON.parse(msg.content.toString());
      sendNotification(userId, symbol, price);
      ampqChannel.ack(msg);
    } else {
      console.log("Consumer cancelled by server");
    }
  });
})();
