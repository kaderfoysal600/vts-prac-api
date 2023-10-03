const { DataTypes } = require('sequelize');
const sequelize = require("../database/db.js");
const PermissionGroup = require("./permissionGroup.js");

const PermissionGroupItem = sequelize.define("permission_group_items", {
  name: { type: DataTypes.STRING, allowNull: false },
  permission: { type: DataTypes.STRING, allowNull: false, unique: true },
  permission_group_id: { type: DataTypes.INTEGER, references: { model: PermissionGroup, key: 'id' } },
  weight: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 1000 } },
  created_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  created_by: { type: DataTypes.STRING },
  updated_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
  updated_by: { type: DataTypes.STRING },
  status: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = PermissionGroupItem;