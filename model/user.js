const { DataTypes } = require('sequelize');
const sequelize = require("../database/db.js");
// const bcrypt = require("bcrypt");
// saltRounds = 10;

const User = sequelize.define("users", {
  first_name: { type: DataTypes.STRING },
  last_name: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING },
  mobile: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
  address: { type: DataTypes.STRING },
  role_id: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  photo: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  // status: { type: DataTypes.STRING },
  created_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = User;