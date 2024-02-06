CREATE TABLE users (
  id serial PRIMARY KEY,
  deviceToken text
);
CREATE TABLE price_subscriptions (
  id serial PRIMARY KEY,
  userId integer REFERENCES users(id),
  symbol varchar(4),
  price decimal,
  above boolean
);