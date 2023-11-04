import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/dbconnection.js';
import { sendWelcomeEmail } from './sendmailService.js';

class UserController {
    static userRegistration = async (req, res) => {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ status: 'failed', message: 'All fields are required' });
        }
        try {
            const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            if (results.length > 0) {
                return res.status(400).json({ status: 'failed', message: 'Email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);

            const insertUserQuery = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(insertUserQuery, [username, email, hashpassword, role]);

            const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            const tokenPayload = { userID: user[0].user_id, role: user[0].role };
            let accessLevel = 'user'; // Default access level

            if (user[0].role === 'student') {
                accessLevel = 'student';
            } else if (user[0].role === 'teacher') {
                accessLevel = 'teacher';
            }

            const token = jwt.sign({ ...tokenPayload, accessLevel }, process.env.JWT_SECRET_KEY);

            res.status(201).json({
                status: 'success',
                message: 'You are registered successfully',
                token: token
            });

            try {
                await sendWelcomeEmail(email);
                console.error("send mail successfully");
            } catch (error) {
                console.error("Failed to send welcome email:", error);
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ status: 'failed', message: 'Unable to register' });
        }
    }

    static UserLogin = async (req, res) => {
        const { email, password } = req.body;

        if (email && password) {
            try {
                const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

                if (user.length === 0) {
                    return res.status(400).json({ status: 'failed', message: 'User not found' });
                }

                const isValidPwd = await bcrypt.compare(password, user[0].password);

                if (!isValidPwd) {
                    return res.status(400).json({ status: 'failed', message: 'Invalid password' });
                }

                const tokenPayload = { userID: user[0].user_id, role: user[0].role };
                let accessLevel = 'user'; // Default access level

                if (user[0].role === 'student') {
                    accessLevel = 'student';
                } else if (user[0].role === 'teacher') {
                    accessLevel = 'teacher';
                }

                const token = jwt.sign({ ...tokenPayload, accessLevel }, process.env.JWT_SECRET_KEY);

                return res.status(200).json({ status: 'success', message: 'Login successful', token: token });
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ status: 'failed', message: 'Internal server error' });
            }
        } else {
            return res.status(400).json({ status: 'failed', message: 'All fields are required' });
        }
    }
}

export default UserController;
