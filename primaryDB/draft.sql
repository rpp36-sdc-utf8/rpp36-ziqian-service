SELECT id AS product_id,
        (
          SELECT json_object_agg(rating, count) AS ratings
          FROM (
            SELECT rating, count(*)
            FROM hr_sdc.reviews
            WHERE product_id=5
            AND reported=false
            GROUP BY rating
          ) AS rating
        ),
        (
          SELECT json_object_agg(recommend, count) AS recommended
          FROM (
            SELECT recommend, count(*)
            FROM hr_sdc.reviews
            WHERE product_id=5
            AND reported=false
            GROUP BY recommend
          ) AS recommend
        ),
        (
          SELECT json_object_agg(char_name, obj)
          FROM (
            SELECT name as char_name, json_build_object('id', id, 'value', value) AS obj
            FROM (
                SELECT characteristic_id as id, name, avg(value) AS value
                FROM hr_sdc.characteristic_reviews rv
                JOIN hr_sdc.characteristics char on char.id=rv.characteristic_id
                JOIN hr_sdc.reviews r on r.id=rv.review_id where r.reported=false and char.product_id=5
                GROUP BY characteristic_id, name
              ) AS sub
          ) AS characteristics
        )
        FROM hr_sdc.products
        WHERE id=5;


CREATE OR REPLACE TEMP VIEW reviews_product AS
      SELECT *
      FROM hr_sdc.reviews
      WHERE product_id=991963
      AND reported=false;

SELECT id AS review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
      FROM reviews_product

      ORDER BY
      CASE
        WHEN (SELECT max(helpfulness) FROM reviews_product)=0 IS TRUE THEN date
        ELSE (helpfulness / (SELECT max(helpfulness) FROM reviews_product) * 0.7
          + date / (SELECT max(date) FROM reviews_product) * 0.3)
      END DESC

      LIMIT 5
      OFFSET 0;