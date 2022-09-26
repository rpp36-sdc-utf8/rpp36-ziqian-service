DROP SCHEMA IF EXISTS hr_sdc CASCADE;
CREATE SCHEMA hr_sdc;

CREATE TABLE hr_sdc.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slogan TEXT,
  description TEXT,
  category TEXT NOT NULL,
  default_price TEXT
);


CREATE TABLE hr_sdc.characteristics (
  id SERIAL PRIMARY KEY,
  product_id INT references hr_sdc.products NOT NULL,
  name TEXT NOT NULL
);

CREATE INDEX char_for_product ON hr_sdc.characteristics (product_id);

CREATE TABLE hr_sdc.reviews (
  id SERIAL PRIMARY KEY,
  product_id INT references hr_sdc.products NOT NULL,
  rating INT NOT NULL,
  date BIGINT NOT NULL, -- data information stored as milisecond number, still can order by number to perform sort by newest
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  recommend boolean NOT NULL,
  reported BOOLEAN DEFAULT FALSE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  response TEXT DEFAULT NULL,
  helpfulness INT DEFAULT 0
);

CREATE INDEX review_for_product ON hr_sdc.reviews (product_id);

CREATE TABLE hr_sdc.characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT references hr_sdc.characteristics NOT NULL,
  review_id INT references hr_sdc.reviews NOT NULL,
  value INT NOT NULL
);

CREATE INDEX char_index ON hr_sdc.characteristic_reviews (characteristic_id);
CREATE INDEX review_index ON hr_sdc.characteristic_reviews (review_id);

CREATE TABLE hr_sdc.photos (
  id SERIAL PRIMARY KEY,
  review_id INT references hr_sdc.reviews(id) NOT NULL,
  url TEXT NOT NULL
);

CREATE INDEX photo_for_reviews ON hr_sdc.photos (review_id);