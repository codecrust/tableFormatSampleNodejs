"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
//console.log(connection);
connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
});
exports.register = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body);
        if (req.body == undefined)
            return;
        const password = req.body.password;
        const encryptedPassword = yield bcrypt.hash(password, saltRounds);
        var users = {
            "email": req.body.email,
            "password": encryptedPassword
        };
        connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
            if (error) {
                res.send({
                    "code": 400,
                    "failed": "error ocurred"
                });
            }
            else {
                res.send({
                    "code": 200,
                    "success": "user registered sucessfully"
                });
            }
        });
    });
};
exports.login = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var email = req.body.email;
        var password = req.body.password;
        connection.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
            return __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    res.send({
                        "code": 400,
                        "failed": "error ocurred"
                    });
                }
                else {
                    if (results.length > 0) {
                        const comparision = yield bcrypt.compare(password, results[0].password);
                        if (comparision) {
                            res.send({
                                "code": 200,
                                "success": "login sucessfull"
                            });
                        }
                        else {
                            res.send({
                                "code": 204,
                                "success": "Email and password does not match"
                            });
                        }
                    }
                    else {
                        res.send({
                            "code": 206,
                            "success": "Email does not exits"
                        });
                    }
                }
            });
        });
    });
};
//# sourceMappingURL=loginroutes.js.map