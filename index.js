const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();
const PORT = 3000; // You can choose any available port
const bodyParser = require('body-parser');
const sequelize = require("./database/db.js");
const api = require('./routs/api.js');
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(session({
  secret: 'secret-600',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json());
// MySQL Connection
(async () => {
    try {
      await sequelize.authenticate();
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  })();

app.use("/api", api);
app.use(express.json());

app.use('/uploads', express.static('uploads'));
// Start the server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});