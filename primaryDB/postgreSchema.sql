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

CREATE TABLE hr_sdc.reviews (
  id SERIAL PRIMARY KEY,
  reviewer_name TEXT,
  reviewer_email TEXT,
  rating INT,
  summary TEXT,
  recommend boolean,
  body TEXT,
  date BIGINT, -- data information stored as milisecond number, still can order by number to perform sort by newest
  response TEXT NULL,
  helpfulness INT DEFAULT 0,
  reported BOOLEAN DEFAULT FALSE,
  product_id INT references hr_sdc.products
);

CREATE INDEX review_for_product ON hr_sdc.reviews (product_id);
-- CREATE INDEX review_helpful ON hr_sdc.reviews (product_id, helpfulness DESC NULLS LAST);
-- CREATE INDEX review_date ON hr_sdc.reviews (product_id, date DESC NULLS LAST);


-- CREATE TABLE hr_sdc.characteristics (
--   id SERIAL PRIMARY KEY,
--   name TEXT,
--   value_total INT DEFAULT 0,
--   value_count INT DEFAULT 0,
--   product_id INT references hr_sdc.products
-- );

CREATE TABLE hr_sdc.characteristics (
  id SERIAL PRIMARY KEY,
  name TEXT,
  product_id INT references hr_sdc.products
);

CREATE INDEX char_for_product ON hr_sdc.characteristics (product_id);

CREATE TABLE hr_sdc.characteristic_reviews (
  id SERIAL PRIMARY KEY,
  characteristic_id INT references hr_sdc.characteristics,
  review_id INT references hr_sdc.reviews,
  value INT
);

CREATE INDEX char_index ON hr_sdc.characteristic_reviews (characteristic_id);
CREATE INDEX review_index ON hr_sdc.characteristic_reviews (review_id);

CREATE TABLE hr_sdc.photos (
  id SERIAL PRIMARY KEY,
  url TEXT,
  review_id INT references hr_sdc.reviews(id)
);

CREATE INDEX photo_for_reviews ON hr_sdc.photos (review_id);