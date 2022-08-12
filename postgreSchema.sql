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
  value_total INT DEFAULT 0,
  value_count INT DEFAULT 0,
  product_id INT references hr_sdc.products
);

CREATE TABLE hr_sdc.reviews (
  id SERIAL PRIMARY KEY,
  reviewer_name TEXT,
  reviewer_email TEXT,
  rating INT,
  summary TEXT,
  recommend boolean,
  body TEXT,
  date BIGINT, -- data information stored as milisecond number, still can order by number to perform sort by newest
  characteristics JSON,
  response TEXT NULL,
  helpfulness INT DEFAULT 0,
  reported BOOLEAN DEFAULT FALSE,
  product_id INT references hr_sdc.products
);

CREATE TABLE hr_sdc.photos (
  id SERIAL PRIMARY KEY,
  url TEXT,
  review_id INT references hr_sdc.reviews(id)
);