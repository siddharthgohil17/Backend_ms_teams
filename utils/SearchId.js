import db from '../config/dbconnection.js';

const SearchId = async (req, res) => {
    const { email } = req.body;

    try {
        const user_id_query = 'SELECT user_id FROM users WHERE email = ?';
        const [rows] = await db.query(user_id_query, [email]);

        if (rows.length > 0) {
            const userId = rows[0].user_id;
            res.status(200).json({ user_id: userId });
        } else {
            res.status(404).json({ message: 'User with the provided email not found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default SearchId;
