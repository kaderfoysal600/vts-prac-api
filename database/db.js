const Sequelize = require('sequelize');

// @ts-ignore
const sequelize = new Sequelize("foysal_db", "root", "db987!@#", {
  host: "localhost",
  dialect: "mysql",
  define: {
    timestamps: false
  },
  // operatorAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;