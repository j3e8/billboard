var mysql = require('mysql');
var config = require('config');
var creds = config.get('database');
var mysql_con = mysql.createConnection(creds);

mysql_con.connect(function(err) {
  if (err) {
    console.log("Error connecting to MySQL");
    return;
  }
});

module.exports = mysql_con;
