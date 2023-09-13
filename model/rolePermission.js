const { DataTypes } = require('sequelize');
const sequelize = require("../database/db");
const Role = require("../model/role.js"); // Import the Role model
const PermissionGroup = require("../model/permissionGroup.js"); // Import the PermissionGroup model

const RolePermission = sequelize.define("role_permissions", {
  role_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Role, key: 'id' } },
  permission_group_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: PermissionGroup, key: 'id' } },
  permission: { type: DataTypes.STRING }
});

module.exports = RolePermission;