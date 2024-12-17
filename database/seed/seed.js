const format = require("pg-format");
const db = require("../connection");
const { convertTimestampToDate } = require("../utils");

const seed = ({ userData, itemData, reviewData, questionData, answerData }) => {
  return db
    .query(`DROP EXTENSION IF EXISTS pgcrypto CASCADE;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS answers;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS questions;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS reviews;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS items;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`CREATE EXTENSION pgcrypto;`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        user_name VARCHAR(40) NOT NULL,
        email VARCHAR(40) NOT NULL,
        password VARCHAR(150) NOT NULL,
        avatar_url VARCHAR(150) DEFAULT 'https://cdn-icons-png.flaticon.com/512/6097/6097300.png'
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE items (
        item_id SERIAL PRIMARY KEY,
        name VARCHAR(40) NOT NULL,
        price FLOAT NOT NULL,
        image_url VARCHAR(150) NOT NULL,
        brand VARCHAR(40) NOT NULL,
        badge VARCHAR(40),
        tag VARCHAR(40) NOT NULL
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE reviews (
        review_id SERIAL PRIMARY KEY,
        star_rating integer CHECK (star_rating > 0 and star_rating < 6),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        img_url VARCHAR(300),
        title VARCHAR(50) NOT NULL,
        body VARCHAR(500) NOT NULL,
        user_id INT REFERENCES users(user_id) NOT NULL,
        item_id INT REFERENCES items(item_id) NOT NULL
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE questions (
        question_id SERIAL PRIMARY KEY,
        body VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        user_id INT REFERENCES users(user_id) NOT NULL,
        item_id INT REFERENCES items(item_id) NOT NULL
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE answers (
        answer_id SERIAL PRIMARY KEY,
        body VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        item_id INT REFERENCES items(item_id) NOT NULL,
        question_id INT REFERENCES questions(question_id) NOT NULL
      );`);
    })
    .then(() => {
      // const formattedUserData = userData.map(convertTimestampToDate);
      const insertUsersQueryStr = format(
        "INSERT INTO users (user_name, email, password, avatar_url) VALUES %L;",
        userData.map(({ user_name, email, password, avatar_url }) => [
          user_name,
          email,
          password,
          avatar_url,
        ])
      );
      return db.query(insertUsersQueryStr);
    })
    .then(() => {
      const insertItemQueryStr = format(
        "INSERT INTO items (name, price, image_url, brand, badge, tag) VALUES %L;",
        itemData.map(({ name, price, image_url, brand, badge, tag }) => [
          name,
          price,
          image_url,
          brand,
          badge,
          tag,
        ])
      );
      return db.query(insertItemQueryStr);
    })
    .then(() => {
      const formattedReviewData = reviewData.map(convertTimestampToDate);
      const insertReviewQueryStr = format(
        "INSERT INTO reviews (star_rating, created_at, img_url, title, body, user_id, item_id) VALUES %L;",
        formattedReviewData.map(
          ({
            star_rating,
            created_at,
            img_url,
            title,
            body,
            user_id,
            item_id,
          }) => [
            star_rating,
            created_at,
            img_url,
            title,
            body,
            user_id,
            item_id,
          ]
        )
      );
      return db.query(insertReviewQueryStr);
    })
    .then(() => {
      const formattedQuestionData = questionData.map(convertTimestampToDate);
      const insertQuestionQueryStr = format(
        "INSERT INTO questions (body, created_at, user_id, item_id) VALUES %L;",
        formattedQuestionData.map(({ body, created_at, user_id, item_id }) => [
          body,
          created_at,
          user_id,
          item_id,
        ])
      );
      return db.query(insertQuestionQueryStr);
    })
    .then(() => {
      const formattedAnswerData = answerData.map(convertTimestampToDate);
      const insertAnswerQueryStr = format(
        "INSERT INTO answers (body, created_at, item_id, question_id) VALUES %L;",
        formattedAnswerData.map(
          ({ body, created_at, item_id, question_id }) => [
            body,
            created_at,
            item_id,
            question_id,
          ]
        )
      );
      return db.query(insertAnswerQueryStr);
    });
};

module.exports = seed;
