const db = require('../db.js');


async function getAllSessions(userId) {
    const { rows } = await db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY climb_date DESC, created_at DESC',
        [userId]
    );
    console.log(rows);
    return rows;
}

async function getActiveSession(userId) {
    const { rows } = await db.query(`SELECT * FROM sessions WHERE user_id = $1 And current_status = 'Active' LIMIT 1 `,
        [userId]
    );
    return rows[0];
}

async function createSession(userId, sessionData) {
    const { gym, climb_date } = sessionData;
    
    const { rows } = await db.query(`INSERT INTO sessions (user_id, gym, climb_date, current_status)
        VALUES ($1, $2, $3, 'Active')
        RETURNING *`,
        [userId, gym, climb_date]
    );
    return rows[0];
}

async function endSession(sessionId, userId) {
    const { rows } = await db.query(
        `UPDATE sessions 
        SET current_status = 'Finished'
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
        [sessionId, userId]
    );
    return rows[0];
}

async function deleteSession(session_id, userId) {
    const { rows } = await db.query('DELETE FROM sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
    );
    return rowCount > 0;   
}

module.exports = {
    getAllSessions,
    getActiveSession,
    createSession,
    endSession,
    deleteSession
}





