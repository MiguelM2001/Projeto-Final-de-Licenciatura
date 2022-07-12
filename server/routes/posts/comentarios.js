const express = require("express");
const router = express.Router();
const masterPool = require("../../database");

router.post("/add", async (req, res) => {
  let id_comentador = req.user.id;
  let texto = req.body.texto;
  let id_post = req.body.post_id;

  let AddComment =
    "INSERT INTO comentarios (id_post,texto,id_comentador) VALUES(?,?,?)";
  await new Promise((resolve, reject) =>
    masterPool.query(
      AddComment,
      [id_post, texto, id_comentador],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          res.send("ok");
        }
      }
    )
  );
});

router.post("/get", async (req, res) => {
  let post_id = req.body.post_id;

  let GetComments =
    "SELECT comentarios.texto, users.profile_pic,users.nome FROM comentarios INNER JOIN users ON (comentarios.id_comentador = users.id) WHERE id_post = ?";
  await new Promise((resolve, reject) =>
    masterPool.query(GetComments, [post_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
        res.json(result);
      }
    })
  );
});

module.exports = router;
