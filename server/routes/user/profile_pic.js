const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const router = express.Router();
var db = require("../../database");
const fs = require("fs");

// Upload Endpoint
router.post("/", (req, res) => {
  // Se não for enviado nada
  if (req.body === null) {
    return res.send("No file uploaded");
  }

  // variaveis temp
  const user_id = req.user.id;

  const file = req.files.file;
  const file_name = req.files.file.name;

  // Redifinir o nome do ficheiro com o id do user
  req.files.file.name = req.user.id;

  // Obter o tipo do ficheiro
  split = file_name.split(".");
  type = split.pop();

  // Definir o path onde a imagem irá ser guardada
  let x = path.join(
    __dirname,
    `../../../projeto/public/profile_pictures/${user_id}.${type}`
  );

  // Auxiliar para procurar imagem de um utilizador
  let folder = path.join(
    __dirname,
    `../../../projeto/public/profile_pictures/`
  );

  // Verificar se o tipo de imagem é aceite
  if (verificar_tipo(type) === 1) {
    // Verificar se o utilizador tem alguma imagem
    // Se tiver irá remover
    verificar_existencia_imagem(user_id, folder);

    // Mover o ficheiro para o destino
    file.mv(x, (err) => {
      if (err) {
        return res.send(err);
      }

      const path_final = `/profile_pictures/${user_id}.${type}`;
      const updatePath = "UPDATE users SET profile_pic =  ? WHERE id=?";
      db.query(updatePath, [path_final, user_id]);
    });
  } else {
    res.send("Tipo de ficheiro não aceite");
  }
});

//
function verificar_tipo(type) {
  if (type === "jpg" || type === "jpeg" || type === "png" || type === "raw") {
    return 1;
  } else {
    return -1;
  }
}

function verificar_existencia_imagem(id, folder) {
  let nomes_ficheiros = [];
  let ficheiros = [];

  // Obter todos os ficheiros da pasta
  // Guarda-los num array
  fs.readdirSync(folder).forEach((file) => {
    split = file.split(".");
    file_name = split[0];
    ficheiros.push(file);
    nomes_ficheiros.push(file_name);
  });

  // Caso existir alguma foto com o mesmo id
  // Remover o ficheiro
  for (i = 0; i < nomes_ficheiros.length; i++) {
    if (id.toString() === nomes_ficheiros[i]) {
      let x = path.join(
        __dirname,
        `../../../projeto/public/profile_pictures/${ficheiros[i]}`
      );
      fs.unlinkSync(x);
    }
  }
}

module.exports = router;
