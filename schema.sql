	show databases;
	use CLASSROOM;

	CREATE TABLE users (
		user_id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(50) NOT NULL,
		email VARCHAR(100) NOT NULL,
		password VARCHAR(100) NOT NULL ,
		role VARCHAR(50) NOT NULL
		);
	select * from users;
		CREATE TABLE assignments (
		assignment_id INT PRIMARY KEY AUTO_INCREMENT,
		teacher_id INT,
		assignment_name VARCHAR(100) NOT NULL,
		assignment_description TEXT,
		assigned_date Date,
		due_date Date,
		FOREIGN KEY (teacher_id) REFERENCES users(user_id)
	);
	select * from assignments;
		CREATE TABLE submission (
		submission_id INT PRIMARY KEY AUTO_INCREMENT,
		assignment_id INT,
		student_id INT,
		submission_date DATE,
		submitted_content TEXT,
		marks DECIMAL(5, 2) DEFAULT 0,
		FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
		FOREIGN KEY (student_id) REFERENCES users(user_id)
	);
	select * from submission;



