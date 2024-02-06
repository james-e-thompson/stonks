const amqplib = require("amqplib");
const { subscriptionFromRow } = require("./db");
const axios = require("axios");
require("dotenv").config();
const { pool } = require("./db");

let ampqChannel;
const queue = "stock-events";

const getPrice = async (symbol) => {
  const { data } = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
  );
  return data.c;
};

const fetchPrices = async (prices) => {
  const result = await pool.query(
    "select distinct symbol from price_subscriptions;"
  );
  for (row of result.rows) {
    prices[row.symbol] = await getPrice(row.symbol);
  }
};

const relevantRows = async (symbol, previousPrice, currentPrice) => {
  if (previousPrice === undefined) {
    const result = await pool.query(
      "select * from price_subscriptions where symbol=$1;",
      [symbol]
    );
    return result.rows.map(subscriptionFromRow);
  } else {
    const [lowerPrice, higherPrice] = [currentPrice, previousPrice].sort(
      (a, b) => a - b
    );
    const result = await pool.query(
      "select * from price_subscriptions where symbol=$1 and price between $2 and $3",
      [symbol, lowerPrice, higherPrice]
    );
    return result.rows.map(subscriptionFromRow);
  }
};

const notificationsFromPrices = async (previousPrices, prices) => {
  const notifications = [];
  for (symbol of Object.keys(prices)) {
    const rows = await relevantRows(
      symbol,
      previousPrices[symbol],
      prices[symbol]
    );
    for (row of rows) {
      const { userId, above, price } = row;
      if (
        (above && prices[symbol] > price) ||
        (!above && prices[symbol] < price)
      ) {
        notifications.push({ userId, symbol, price: prices[symbol] });
      }
    }
  }
  return notifications;
};

const pushNotifications = (notifications) => {
  for (notification of notifications) {
    ampqChannel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)), {
      mandatory: true,
    });
  }
};

(async () => {
  const ampqConnection = await amqplib.connect("amqp://localhost");
  ampqChannel = await ampqConnection.createChannel();
  await ampqChannel.assertQueue(queue);
  let previousPrices = {};
  let prices = {};
  setInterval(async () => {
    prices = {};
    await fetchPrices(prices);
    const notifications = await notificationsFromPrices(previousPrices, prices);
    console.log({ notifications });
    pushNotifications(notifications);
    previousPrices = { ...prices };
  }, 10 * 1000);
})();
