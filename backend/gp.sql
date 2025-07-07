create database gp;
use gp;
create table users(
id int primary key auto_increment,
name varchar(255),
email varchar(255) ,
password varchar(255),
level int not null,
verified boolean default false
);

use gp;
CREATE TABLE educational_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    level INT NOT NULL CHECK (level BETWEEN 1 AND 3)
);


USE gp;
CREATE TABLE quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level INT NOT NULL,
    question_text TEXT NOT NULL,
    option1 VARCHAR(255) NOT NULL,
    option2 VARCHAR(255) NOT NULL,
    option3 VARCHAR(255),
    option4 VARCHAR(255),
    correct_answer INT NOT NULL
);

