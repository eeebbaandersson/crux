const db = require('../db.js');

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


// create user with hashed password using bcrypt
async function createUser(username, email, password) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await db.query(`INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at`,
        [username, email, passwordHash]
    );
    return rows[0];
}

async function getUserByUsername(username) {
    const { rows } = await db.query('SELECT * FROM users WHERE username = $1',
        [username]
    );
    return rows[0]; 
}

async function verifyPassword(plainPassword, storedHash) {
    return await bcrypt.compare(plainPassword, storedHash);
}

async function getUserById(id) {
    const { rows } = await db.query('SELECT id, username, email, password_hash, created_at FROM users WHERE id = $1', [id]);
    return rows[0];

}


async function updateUserInfo(id, userData) {
    const { username, email, password } = userData;

    // Get current user data
    const currentUser = await getUserById(id);
    if (!currentUser) return null;

    // hash password
    let passwordHash = null;
    if (password) {
        passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const newUsername = username || currentUser.username;
    const newEmail = email || currentUser.email;
    const newPasswordHash = passwordHash || currentUser.password_hash;


    const { rows } = await db.query(
        `UPDATE users 
        SET username = $1, email = $2, password_hash = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, username, email, created_at`,
        [newUsername, newEmail, newPasswordHash, id]
    );
    return rows[0];
}

async function deleteUser(id) {
    const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;

}

module.exports = {
    createUser,
    getUserById,
    verifyPassword,
    getUserByUsername,
    updateUserInfo,
    deleteUser
};




