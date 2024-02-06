const { Pool } = require("pg");
require("dotenv").config();

let pool;

(async () => {
  /*
  pool = new Pool({
    host: "localhost",
    database: "stonks",
    user: "postgres",
    password: process.env.DB_PASSWORD,
  });
  */
  pool = new Pool({
    host: "localhost",
    database: "stock-events",
  });
  await pool.connect();
})();

const subscriptionFromRow = (row) => {
  const { id, user_id: userId, symbol, price, above } = row;
  return { id, userId, symbol, price: parseFloat(price), above };
};
const userFromRow = (row) => {
  const { id, device_token: deviceToken } = row;
  return { id, deviceToken };
};

module.exports = { subscriptionFromRow, userFromRow, pool };
