const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const auth = require("../middlewares/jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const DicasModel = require("../models/DicasModel");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
  // Validate fields.
  body("firstName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("lastName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Last name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters."),
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    }),
  body("password")
    .isLength({ min: 6 })
    .trim()
    .withMessage("Password must be 6 characters or greater."),
  // Sanitize fields.
  sanitizeBody("firstName").escape(),
  sanitizeBody("lastName").escape(),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape(),
  // Process request after validation and sanitization.
  (req, res) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Display sanitized values/errors messages.
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //hash input password
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          // Create User object with escaped and trimmed data
          var user = new UserModel({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hash,
            status: true,
            eletrodomesticos: [],
            meta: 0,
            leituras: [],
            historico: [],
          });
          user.save(function (err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            }
            let userData = {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              eletrodomesticos: [],
              meta: 0,
              leituras: [],
              historico: [],
            };
            return apiResponse.successResponseWithData(
              res,
              "Registration Success.",
              userData
            );
          });
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address."),
  body("password")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Password must be specified."),
  sanitizeBody("email").escape(),
  sanitizeBody("password").escape(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        UserModel.findOne({ email: req.body.email }).then((user) => {
          if (user) {
            //Compare given password with db's hash.
            bcrypt.compare(req.body.password, user.password, function (
              err,
              same
            ) {
              if (same) {
                if (user.status) {
                  let userData = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                  };
                  //Prepare JWT token for authentication
                  const jwtPayload = userData;
                  const jwtData = {
                    expiresIn: process.env.JWT_TIMEOUT_DURATION,
                  };
                  const secret = process.env.JWT_SECRET;
                  //Generated JWT token with Payload and secret.
                  userData.token = jwt.sign(jwtPayload, secret, jwtData);
                  return apiResponse.successResponseWithData(
                    res,
                    "Login Success.",
                    userData
                  );
                } else {
                  return apiResponse.unauthorizedResponse(
                    res,
                    "Account is not active. Please contact admin."
                  );
                }
              } else {
                return apiResponse.unauthorizedResponse(
                  res,
                  "Email or Password wrong."
                );
              }
            });
          } else {
            return apiResponse.unauthorizedResponse(
              res,
              "Email or Password wrong."
            );
          }
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];

exports.getLeituras = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundEletro) => {
      if (foundEletro === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          return apiResponse.successResponseWithData(
            res,
            "Get Leituras success",
            foundEletro.leituras
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.setLeituras = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundDicas) => {
      if (foundDicas === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          UserModel.updateOne(
            { _id: req.user._id },
            { $set: { leituras: req.body.leituras } },
            (err) => {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponseWithData(
                  res,
                  "Leituras Updated Success.",
                  req.body.leituras
                );
              }
            }
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.getHistorico = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundEletro) => {
      if (foundEletro === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          return apiResponse.successResponseWithData(
            res,
            "Get Historico success",
            foundEletro.historico
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.setHistorico = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundDicas) => {
      if (foundDicas === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          UserModel.updateOne(
            { _id: req.user._id },
            { $set: { historico: req.body.historico } },
            (err) => {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponseWithData(
                  res,
                  "Historico Updated Success.",
                  req.body.historico
                );
              }
            }
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.getEletrodomesticos = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundEletro) => {
      if (foundEletro === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          return apiResponse.successResponseWithData(
            res,
            "Get Eletro success",
            foundEletro.eletrodomesticos
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.setEletrodomesticos = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundDicas) => {
      if (foundDicas === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          UserModel.updateOne(
            { _id: req.user._id },
            { $set: { eletrodomesticos: req.body.eletrodomesticos } },
            (err) => {
              if (err) {
                return apiResponse.ErrorResponse(res, err);
              } else {
                return apiResponse.successResponseWithData(
                  res,
                  "Eletrodomesticos Updated Success.",
                  req.body.eletrodomesticos
                );
              }
            }
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];

exports.profile = [
  auth,
  (req, res) => {
    UserModel.findById(req.user._id, (err, foundEletro) => {
      if (foundEletro === null) {
        return apiResponse.validationErrorWithData(res, "Not Found", []);
      } else {
        try {
          let objData = {
            firstName: foundEletro.firstName,
            lastName: foundEletro.lastName,
            email: foundEletro.email,
            meta: foundEletro.meta,
          };
          return apiResponse.successResponseWithData(
            res,
            "Get Profile success",
            foundEletro.eletrodomesticos
          );
        } catch (err) {
          return apiResponse.ErrorResponse(res, err);
        }
      }
    });
  },
];