// npm run devStart

const bodyParser = require("body-parser");

const express = require("express");

const fileUpload = require("express-fileupload");

const cors = require("cors");

const app = express();

const cron = require("node-cron");

const masterPool = require("./database");

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
  })
);

app.use(bodyParser.json({ limit: "5mb", extended: true }));

app.use(
  fileUpload({
    limits: {
      fileSize: 20000000, //20mb
    },
  })
);

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI("2e1b17beaedb49cb85b68181fa3635a3");

async function savePostAPI(data, author, Title, Content, imgURL, url) {
  let sqlInsertPost =
    "INSERT INTO posts (author, title, content, date, image, url) VALUES(?,?,?,?,?,?) ";

  let Insert = await new Promise((resolve, reject) =>
    masterPool.query(
      sqlInsertPost,
      [author, Title, Content, data, imgURL, url, data],
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

// Ir buscar posts uma vez por dia
cron.schedule(" 0 0 * * *", async () => {
  newsapi.v2
    .topHeadlines({
      language: "pt",
      country: "pt",
    })
    .then(async (news_api) => {
      let posts;
      let GetPosts =
        "SELECT id, date, content, title, image, url, author FROM  posts ORDER BY date DESC";
      let ResultsRecord = await new Promise((resolve, reject) =>
        masterPool.query(GetPosts, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
            posts = result;
          }
        })
      );

      const url = news_api.articles.map((o) => o.url);
      const filtered = news_api.articles.filter(
        ({ url }, index) => !url.includes(url, index + 1)
      );
      for (j = 0; j < filtered.length; j++) {
        //s = filtered.publishedAt.match("T").slice(1);
        data = filtered[j].publishedAt.split("T");
        data_final = data[0];
        let check = 1;
        for (i = 0; i < posts.length; i++) {
          if (posts[i].url === filtered[j].url) {
            check = -1;
          }
        }
        if (check === 1) {
          await savePostAPI(
            data_final,
            filtered[j].source.name,
            filtered[j].title,
            filtered[j].description,
            filtered[j].urlToImage,
            filtered[j].url
          );
        }
      }
    });
});

// Routes

const loginRoute = require("./routes/autenticacao/login");
const registarRoute = require("./routes/autenticacao/registar");
const authRoute = require("./routes/autorizacao/auth");
const tokenRoute = require("./routes/autorizacao/novo_token");
const profile_pic = require("./routes/user/profile_pic");
const validate_user = require("./routes/autorizacao/validar_user");
const info_user = require("./routes/user/info");
const update_user = require("./routes/user/update_user");
const info_profile_user = require("./routes/user/info_profile_user");
const amizade_status = require("./routes/user/amizade_status");
const add_remove_update_amizade = require("./routes/user/add_remove_update_amizade");
const create_post = require("./routes/posts/adicionar");
const get_posts = require("./routes/posts/obter");
const add_get_comments = require("./routes/posts/comentarios");

//////////////////////////////////////////
//////////////////////////////////////////

// Middleware
// Significa que cada vez que isso aparece num endpoint
// Isto vai ser executado
// Mas só se eu adicionar como Middleware
// Caso contrário apenas vai ignorar a expressão "/auth"

app.use("/auth", authRoute);

//////////////////////////////////////////
//////////////////////////////////////////

// Endpoints
app.use("/login", loginRoute);
app.use("/registar", registarRoute);
app.use("/novo_token", tokenRoute);
app.use("/auth/upload", profile_pic);
app.use("/validar_user", validate_user);
app.use("/auth/info", info_user);
app.use("/auth/update_user", update_user);
app.use("/auth/info_profile_user", info_profile_user);
app.use("/auth/amizade_status", amizade_status);
app.use("/auth/pedidos_amizade", add_remove_update_amizade);
app.use("/auth/posts/add", create_post);
app.use("/auth/posts", get_posts);
app.use("/auth/posts/comentarios", add_get_comments);

//////////////////////////////////////////
//////////////////////////////////////////

app.listen(3001, () => {
  console.log("running on port 3001");
});
