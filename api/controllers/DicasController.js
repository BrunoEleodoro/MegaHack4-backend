const Dicas = require("../models/DicasModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const basic_auth = require("../middlewares/basic_auth");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

/**
 * @swagger
 * /api/dicas:
 *   get:
 *     description: Returns all dicas 
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 
 *         schema:
 *           $ref: '#/definitions/Puppy'
 */
exports.dicasList = [
  function (req, res) {
    try {
      Dicas.find({}).then((dicas) => {
        if (dicas.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            dicas
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.inserirDica = [
  basic_auth,
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  function (req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        let dica = new Dicas({
          title: req.body.title,
          description: req.body.description,
          image: req.body.image,
        });
        dica.save((err) => {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let objData = {
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
          };
          return apiResponse.successResponseWithData(
            res,
            "Dica add Success.",
            objData
          );
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.atualizarDica = [
  basic_auth,
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("description", "Description must not be empty.")
    .isLength({ min: 1 })
    .trim(),

  (req, res) => {
    try {
      const errors = validationResult(req);
      let dica = new Dicas({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        _id: req.params.id,
      });
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          Dicas.findById(req.params.id, function (err, foundDica) {
            if (foundDica === null) {
              return apiResponse.notFoundResponse(
                res,
                "Dica not exists with this id"
              );
            } else {
              Dicas.findByIdAndUpdate(req.params.id, dica, {}, function (err) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                } else {
                  let objData = {
                    title: req.body.title,
                    description: req.body.description,
                    image: req.body.image,
                  };
                  return apiResponse.successResponseWithData(
                    res,
                    "Dica update Success.",
                    objData
                  );
                }
              });
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
exports.deletarDica = [
  basic_auth,
  (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      const errors = validationResult(req);
      let dica = new Dicas({
        title: req.body.title,
        description: req.body.description,
        image: req.body.image,
        _id: req.params.id,
      });
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          Dicas.findById(req.params.id, function (err, foundDica) {
            if (foundDica === null) {
              return apiResponse.notFoundResponse(
                res,
                "Dica not exists with this id"
              );
            } else {
              Dicas.findByIdAndRemove(req.params.id, function (err) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                } else {
                  return apiResponse.successResponse(
                    res,
                    "Book delete Success."
                  );
                }
              });
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
