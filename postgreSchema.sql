\c ziqianli;
DROP SCHEMA IF EXISTS hr_sdc CASCADE;
CREATE SCHEMA hr_sdc;

CREATE TABLE hr_sdc.products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  slogan TEXT,
  description TEXT,
  category TEXT,
  default_price TEXT
);

CREATE TABLE hr_sdc.characteristics (
  id SERIAL PRIMARY KEY,
  name TEXT,
  value INT,
  product_id INT references hr_sdc.products
);

CREATE TABLE hr_sdc.reviews (
  id SERIAL PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  rating INT,
  summary TEXT,
  recommend boolean,
  body TEXT,
  date timestamptz,
  characteristics json,
  response TEXT NULL,
  helpfulness INT DEFAULT 0,
  report BOOLEAN DEFAULT FALSE,
  product_id INT references hr_sdc.products
);

CREATE TABLE hr_sdc.photos (
  id SERIAL PRIMARY KEY,
  url TEXT,
  reviews_id INT references hr_sdc.reviews(id)
);