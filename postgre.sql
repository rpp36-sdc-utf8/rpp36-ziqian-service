DROP DATABASE IF EXISTS hr_sdc;
CREATE DATABASE hr_sdc;
\c hr_sdc;
DROP SCHEMA IF EXISTS reviews CASCADE;
CREATE SCHEMA reviews;

CREATE TABLE reviews.products (
  id SERIAL PRIMARY KEY,
  name varchar,
  slogan varchar(255),
  description varchar(255),
  category varchar(255),
  default_price varchar(255)
);

CREATE TABLE reviews.reviews (
  id SERIAL PRIMARY KEY,
  name varchar(255),
  email varchar(255),
  rating integer,
  summary varchar(255),
  recommend boolean,
  body varchar(255),
  date varchar(255),
  characteristics varchar(255),
  response varchar(255) NULL,
  helpfulness INT DEFAULT 0,
  report BOOLEAN DEFAULT FALSE,
  product_id integer references reviews.products
);

CREATE TABLE reviews.photos (
  id SERIAL PRIMARY KEY,
  url varchar(255),
  reviews_id integer references reviews.reviews(id)
);