const { DataTypes } = require('sequelize');
const sequelize = require("../database/db.js");

const PermissionGroup = sequelize.define("permission_groups", {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  created_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by: { type: DataTypes.STRING },
  updated_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
  updated_by: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false }
});

module.exports = PermissionGroup;