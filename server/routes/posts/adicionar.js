const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const masterPool = require("../../database");

router.post("/", async (req, res) => {
  //Id of user
  //Gotten from token
  let user_id = req.user.id;
  let Title = req.body.title;
  let Content = req.body.content;

  if (req.files == null) {
    await savePost(user_id, Title, Content, res);
    res.json("Post Added");
  } else {
    let file = req.files.file;
    let file_name = req.files.file.name;

    // Obter o tipo do ficheiro
    split = file_name.split(".");
    type = split.pop();

    // Redifinir o nome do ficheiro com o id do user
    req.files.file.name = req.user.id;

    // Obter o tipo do ficheiro
    split = file_name.split(".");
    type = split.pop();

    let GetPostId = await savePost(user_id, Title, Content, res);

    let id_post = GetPostId;

    console.log(id_post);

    let x = path.join(
      __dirname,
      `../../../projeto/public/posts_pictures/${id_post}.${type}`
    );

    // Mover o ficheiro para o destino
    file.mv(x, async (err) => {
      if (err) {
        console.error(err);
        return res.send(err);
      } else {
        //Updating Table with Path

        const path_final = `/posts_pictures/${id_post}.${type}`;
        let sqlUpdate =
          "UPDATE posts SET image =  ?  WHERE id = ? AND id_user = ?";

        let UpdateQuery = await new Promise((resolve, reject) =>
          masterPool.query(
            sqlUpdate,
            [path_final, id_post, user_id],
            (err, result) => {
              if (err) {
                reject(err);
              } else {
                resolve(result);
                res.json("Table Inserted and Updated");
              }
            }
          )
        );
      }
    });
  }
});

async function savePost(UserId, Title, Content, res) {
  let todayDate = new Date().toISOString().slice(0, 10);
  let PostId;

  let sqlInsertPost =
    "INSERT INTO posts (id_user, title, content, date) VALUES ('" +
    UserId +
    "', '" +
    Title +
    "', '" +
    Content +
    "', '" +
    todayDate +
    "')";

  let Insert = await new Promise((resolve, reject) =>
    masterPool.query(sqlInsertPost, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );

  let getPostId =
    "SELECT id FROM posts WHERE id_user = '" +
    UserId +
    "' AND title = '" +
    Title +
    "' AND content = '" +
    Content +
    "' AND date = '" +
    todayDate +
    "'";
  let getId = await new Promise((resolve, reject) =>
    masterPool.query(getPostId, (err, result1) => {
      if (err) {
        reject(err);
      } else {
        resolve(result1);
        PostId = result1[0].id;
      }
    })
  );
  return PostId;
}

router.post("/api", async (req, res) => {
  let news_api = req.body.data;
  let user_id = req.user.id;
  let posts = req.body.posts;
  console.log(news_api);

  const url = news_api.map((o) => o.url);

  const filtered = news_api.filter(
    ({ url }, index) => !url.includes(url, index + 1)
  );
  for (j = 0; j < filtered.length; j++) {
    let check = 1;
    for (i = 0; i < posts.length; i++) {
      if (posts[i].url === filtered[j].url) {
        check = -1;
      }
    }
    if (check === 1) {
      await savePostAPI(
        filtered[j].source.name,
        filtered[j].title,
        filtered[j].description,
        filtered[j].urlToImage,
        filtered[j].url
      );
    }
  }
});

async function savePostAPI(author, Title, Content, imgURL, url) {
  let todayDate = new Date().toISOString().slice(0, 10);

  let sqlInsertPost =
    "INSERT INTO posts (author, title, content, date, image, url) VALUES(?,?,?,?,?, ?) ";

  let Insert = await new Promise((resolve, reject) =>
    masterPool.query(
      sqlInsertPost,
      [author, Title, Content, todayDate, imgURL, url],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    )
  );
}

async function savePost(UserId, Title, Content, res) {
  let todayDate = new Date().toISOString().slice(0, 10);
  let PostId;

  let sqlInsertPost =
    "INSERT INTO posts (id_user, title, content, date) VALUES ('" +
    UserId +
    "', '" +
    Title +
    "', '" +
    Content +
    "', '" +
    todayDate +
    "')";

  let Insert = await new Promise((resolve, reject) =>
    masterPool.query(sqlInsertPost, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  );

  let getPostId =
    "SELECT id FROM posts WHERE id_user = '" +
    UserId +
    "' AND title = '" +
    Title +
    "' AND content = '" +
    Content +
    "' AND date = '" +
    todayDate +
    "'";
  let getId = await new Promise((resolve, reject) =>
    masterPool.query(getPostId, (err, result1) => {
      if (err) {
        reject(err);
      } else {
        resolve(result1);
        PostId = result1[0].id;
      }
    })
  );
  return PostId;
}

module.exports = router;
