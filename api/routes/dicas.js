var express = require("express");
const DicasController = require("../controllers/DicasController");

var router = express.Router();

router.get("/", DicasController.dicasList);
router.post("/inserir", DicasController.inserirDica);
router.put("/:id", DicasController.atualizarDica);
router.delete("/:id", DicasController.deletarDica);

module.exports = router;