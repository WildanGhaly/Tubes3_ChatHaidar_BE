CREATE TABLE users (
  Username VARCHAR(255), 
  Password VARCHAR(255)
);

CREATE TABLE messages (
  username VARCHAR(255),
  chatName VARCHAR(255),
  chatNumber INT,
  messages VARCHAR(1000)
);

CREATE TABLE questions (
  question VARCHAR(1000), 
  answer VARCHAR(1000)
);

INSERT INTO messages (username, chatName, chatNumber, messages) 
VALUES ('Willy', 'General', 1, 'Hello everyone!');