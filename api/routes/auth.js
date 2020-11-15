var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/eletrodomesticos", AuthController.setEletrodomesticos);
router.get("/eletrodomesticos", AuthController.getEletrodomesticos);
router.post("/leituras", AuthController.setLeituras);
router.get("/leituras", AuthController.getLeituras);
router.post("/historico", AuthController.setHistorico);
router.get("/historico", AuthController.getHistorico);
router.get("/profile", AuthController.profile);

module.exports = router;