var mysql = require('mysql');
require('dotenv').config();

var con = mysql.createConnection({
  host      : process.env.MYSQL_HOST,
  user      : process.env.MYSQL_USER,
  password  : process.env.MYSQL_PASSWORD
});

const database = "sql12615211";             // Change this to your MySQL database name

con.connect(function(err) { 
  console.log("Connected!");
  console.log(process.env.MYSQL_HOST);
  console.log(process.env.MYSQL_USER);
  console.log(process.env.MYSQL_PASSWORD);
  if (err) throw err;

  // Check if database exists
  con.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" + database + "'", function (err, result, fields) {
    if (err) throw err;

    if (result.length === 0) {
      // If the database does not exist, create it
      con.query("CREATE DATABASE '" + database + "'", function (err, result) {
        if (err) throw err;
        console.log("Database created");

        // Use the database
        con.query("USE " + database, function (err, result) {
          if (err) throw err; 

          // Create tables
          con.query("CREATE TABLE users (Username VARCHAR(255), Password VARCHAR(255))", function (err, result) {
            if (err) throw err;
            console.log("Users table created");
          });

          con.query("CREATE TABLE messages (username VARCHAR(255), chatName VARCHAR(255), chatNumber INT, messages VARCHAR(1000))", function (err, result) {
            if (err) throw err;
            console.log("Messages table created");
          });

          con.query("CREATE TABLE questions (question VARCHAR(1000), answer VARCHAR(1000))", function (err, result) {
            if (err) throw err;
            console.log("Questions table created");
          });
        });
      });
    } else {
      // If the database already exists, use it
      con.query("USE " + database, function (err, result) {
        if (err) throw err;

        console.log("Database already exists");
      });
    }
  });
}); 


function insertUser(username, password) {
  var sql = "INSERT INTO users (Username, Password) VALUES (\"" + username + "\", \"" + password + "\")";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

function register(username, password) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM users WHERE Username = \"" + username + "\"";
    con.query(sql, function (err, result) {
      if (err) reject(err);
      console.log(result);
      if (result.length === 0) {
        console.log("Registering...");
        insertUser(username, password);
        resolve({success: true});
      } else {
        console.log("Username already exists");
        resolve({success: false});
      }
    });
  }); 
}

function login (username, password) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM users WHERE Username = \"" + username + "\" AND Password = \"" + password + "\"";
    con.query(sql, function (err, result) {
      if (err) reject(err);
      console.log(result);
      if (result.length === 0) {
        console.log("Username or password is wrong");
        resolve({ success: false, message: "Username or password is wrong" });
      } else {
        console.log("Login successful");
        resolve({ success: true, message: "Login successful" });
      }
    });
  });
}

function load(username) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM messages WHERE Username = \"" + username + "\" ORDER BY chatName, chatNumber ASC";
    con.query(sql, function (err, result) {
      if (err) reject(err);
      let chatNameMap = new Map();
      result.forEach((row) => {
        const chatName = row.chatName;
        const message = [row.chatNumber, row.messages];
        if (chatNameMap.has(chatName)) {
          chatNameMap.get(chatName).push(message);
        } else {
          chatNameMap.set(chatName, [message]);
        }
      });
      const messages = [];
      for (let [chatName, messageList] of chatNameMap) {
        messages.push([chatName, ...messageList]);
      }
      resolve(messages);
    });
  });
}

function insertMessage (username, chatName, chatNumber, messages) {
  var sql = "INSERT INTO messages (username, chatName, chatNumber, messages) VALUES (\"" + username + "\", \"" +  chatName + "\"," + chatNumber + ",\"" + messages + "\");";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
}

function insertQuestions(question, answer){
  con.query("INSERT INTO questions (question, answer) VALUES (\"" + question + "\", \"" + answer + "\");", function (err, result){
    if(err) throw err;
    console.log("1 Question inserted");
  });
}

function getQuestions(){
  return new Promise((resolve, reject) => {
    var sql = "SELECT question FROM questions";
    con.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

function getAnswers(question){
  return new Promise((resolve, reject) => {
    var sql = "SELECT answer FROM questions WHERE question = \"" + question + "\"";
    con.query(sql, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

module.exports = { con, insertUser, register, login , insertMessage, insertQuestions, load, getQuestions, getAnswers};