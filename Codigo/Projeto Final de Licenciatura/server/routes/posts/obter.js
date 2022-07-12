const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const masterPool = require("../../database");

router.post("/", async (req, res) => {
  let GetPosts =
    "SELECT id, date, content, title, image, url, author FROM  posts ORDER BY date DESC";
  let ResultsRecord = await new Promise((resolve, reject) =>
    masterPool.query(GetPosts, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        posts = result;
        res.json(posts);
      }
    })
  );
});

router.post("/profile", async (req, res) => {
  let nome = req.body.username;
  //Check if the User Liked the Post already or Not
  let GetPosts =
    "SELECT posts.id, date, content, title, image, id_user, users.nome FROM  posts, users WHERE (id_user = users.id AND id_user = (SELECT id FROM users WHERE nome=?))";
  let ResultsRecord = await new Promise((resolve, reject) =>
    masterPool.query(GetPosts, [nome], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        posts = result;
        res.json(posts);
      }
    })
  );
});

module.exports = router;
