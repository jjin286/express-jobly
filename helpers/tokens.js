"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT {username, isAdmin} from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
    "createToken passed user without isAdmin property");
    
  let payload = {
    username: user.username,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
