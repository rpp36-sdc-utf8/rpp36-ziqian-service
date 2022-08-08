DROP DATABASE IF EXISTS hr_sdc;
CREATE DATABASE hr_sdc;
\c hr_sdc;
DROP SCHEMA IF EXISTS reviews CASCADE;
CREATE SCHEMA reviews;

CREATE TABLE reviews.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  slogan VARCHAR(255),
  description VARCHAR(255),
  category VARCHAR(255),
  default_price VARCHAR(255)
);

CREATE TABLE reviews.characteristics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  value INT,
  product_id INT reference reviews.products
);

CREATE TABLE reviews.reviews (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  rating INT,
  summary VARCHAR(255),
  recommend boolean,
  body VARCHAR(255),
  date timestamptz,
  characteristics json,
  response VARCHAR(255) NULL,
  helpfulness INT DEFAULT 0,
  report BOOLEAN DEFAULT FALSE,
  product_id INT references reviews.products
);

CREATE TABLE reviews.photos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255),
  reviews_id INT references reviews.reviews(id)
);