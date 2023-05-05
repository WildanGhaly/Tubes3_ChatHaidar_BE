require('dotenv').config()
const mysql = require('mysql2')

const con = mysql.createConnection('mysql://2jky2y9kclbkfry07yx3:pscale_pw_nj39aRSNP7o1PYE7CDvPXPkWNqDIlYYdpW5ZflK4Lp1@aws.connect.psdb.cloud/tubes3_stima?ssl={"rejectUnauthorized":true}')
console.log('Connected to PlanetScale!')


con.connect(function(err) {
  if (err) throw err;

  // Check if database exists
  con.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'tubes3_stima'", function (err, result, fields) {
    if (err) throw err;

    if (result.length === 0) {
      // If the database does not exist, create it
      con.query("CREATE DATABASE tubes3_stima", function (err, result) {
        if (err) throw err;
        console.log("Database created");

        // Use the database
        con.query("USE tubes3_stima", function (err, result) {
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
      con.query("USE tubes3_stima", function (err, result) {
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

function updateAnswer(question, answer){
  con.query("UPDATE questions SET answer = \"" + answer + "\" WHERE question = \"" + question + "\";", function (err, result){
    if(err) throw err;
    console.log("1 Question updated");
  });
}

function deleteQuestion(question){
  con.query("DELETE FROM questions WHERE question = \"" + question + "\";", function(err, result){
    if (err) throw err;
    console.log("1 Question deleted");
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

module.exports = { con, insertUser, register, login , insertMessage, insertQuestions, load, getQuestions, getAnswers, updateAnswer, deleteQuestion };