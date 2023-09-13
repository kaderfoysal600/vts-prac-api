const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');


const Role = sequelize.define("user_roles", {
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    created_by:{ type: DataTypes.STRING },
    // date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
  
  module.exports = Role;