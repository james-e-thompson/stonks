const express = require("express");
const morgan = require("morgan");
const { pool, subscriptionFromRow, userFromRow } = require("./db");
const app = express();
const port = 3000;

app.use(express.json());
app.use(morgan("combined"));

app.get("/users", async (req, res) => {
  const { deviceToken } = req.query;
  const { rows } = await pool.query(
    "select * from users where device_token=$1",
    [deviceToken]
  );
  if (rows.length === 0) {
    res.sendStatus(404);
  } else {
    res.json(userFromRow(rows[0]));
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("select * from users where id=$1", [id]);
  res.json(userFromRow(rows[0]));
});

app.post("/users", async (req, res) => {
  const { deviceToken } = req.body;
  const rows = await pool.query(
    "insert into users (device_token) VALUES ($1) returning *",
    [deviceToken]
  );
  res.status(201).json(userFromRow(rows[0]));
});

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { deviceToken } = req.body;
  await pool.query("update users set device_token=$1 where id=$2", [
    deviceToken,
    id,
  ]);
  res.status(200);
});

app.post("/users/:userId/subscriptions", async (req, res) => {
  const { userId } = req.params;
  const { symbol, price, above } = req.body;
  const { rows } = await pool.query(
    "insert into price_subscriptions (user_id, symbol, price, above)\
                              values ($1, $2, $3, $4) \
                              returning *",
    [userId, symbol, price, above]
  );
  res.status(201).json(subscriptionFromRow(rows[0]));
});

app.get("/users/:id/subscriptions", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "select * from price_subscriptions where user_id=$1",
    [id]
  );
  res.json(rows.map(subscriptionFromRow));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
