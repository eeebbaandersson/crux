const db = require('../db.js');

// Hämta alla problem för en specifik användare (kräver JOIN mot sessions)
async function getProblemsByUserId(userId) {
    const { rows } = await db.query(
        `SELECT p.id, p.session_id, p.style, p.grade, p.tries, 
                p.current_status, p.notes, p.created_at,
                s.gym, s.climb_date
         FROM problems p
         JOIN sessions s ON p.session_id = s.id
         WHERE s.user_id = $1
         ORDER BY s.climb_date DESC, p.id DESC`,
        [userId]
    );
    return rows;
}

async function getProblemsBySessionId(sessionId) {
    const { rows } = await db.query(
        `SELECT * FROM problems 
         WHERE session_id = $1 
         ORDER BY created_at DESC, id DESC`,
        [sessionId]
    );
    return rows;
}


async function getProblemById(id, context = {}) {
    const { sessionId, userId } = context;

    if (sessionId) {
        const { rows } = await db.query(
            'SELECT * FROM problems WHERE id = $1 AND session_id = $2',
            [id, sessionId]
        );
        return rows[0];
    }

    if (userId) {
        const { rows } = await db.query(
            `SELECT p.* FROM problems p
             JOIN sessions s ON p.session_id = s.id
             WHERE p.id = $1 AND s.user_id = $2`,
            [id, userId]
        );
        return rows[0];
    }

    const { rows } = await db.query('SELECT * FROM problems WHERE id = $1', [id]);
    return rows[0];
}


async function logNewProblem(target, problemData) {
    const sessionId = typeof target === 'object' ? target.sessionId : target;
    const { style, grade, tries, current_status, notes } = problemData;

    const { rows } = await db.query(
        `INSERT INTO problems (session_id, style, grade, tries, current_status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [sessionId, style, grade, tries || 1, current_status || 'Send', notes]
    );
    return rows[0];  
}

async function updateProblem(id, context, problemData) {
    const sessionId = typeof context === 'object' ? context.sessionId : context;
    const userId = typeof context === 'object' ? context.userId : null;
    const { style, grade, tries, current_status, notes } = problemData;

    if (sessionId) {
        const { rows } = await db.query(
            `UPDATE problems 
             SET style = $1, grade = $2, tries = $3, current_status = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND session_id = $7
             RETURNING *`,
            [style, grade, tries, current_status, notes, id, sessionId]
        );
        return rows[0];
    }

    if (userId) {
        const { rows } = await db.query(
            `UPDATE problems 
             SET style = $1, grade = $2, tries = $3, current_status = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND session_id IN (SELECT id FROM sessions WHERE user_id = $7)
             RETURNING *`,
            [style, grade, tries, current_status, notes, id, userId]
        );
        return rows[0];
    }

    // Fallback om varken sessionId eller userId skickades
    const { rows } = await db.query(
        `UPDATE problems 
         SET style = $1, grade = $2, tries = $3, current_status = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [style, grade, tries, current_status, notes, id]
    );
    return rows[0];
}

async function deleteProblem(id, context) {
    const sessionId = typeof context === 'object' ? context.sessionId : context;
    const userId = typeof context === 'object' ? context.userId : null;

    if (sessionId) {
        const { rowCount } = await db.query(
            'DELETE FROM problems WHERE id = $1 AND session_id = $2', 
            [id, sessionId]
        );
        return rowCount > 0;
    }

    if (userId) {
        const { rowCount } = await db.query(
            `DELETE FROM problems 
             WHERE id = $1 AND session_id IN (SELECT id FROM sessions WHERE user_id = $2)`, 
            [id, userId]
        );
        return rowCount > 0;
    }

    const { rowCount } = await db.query('DELETE FROM problems WHERE id = $1', [id]);
    return rowCount > 0;
}

module.exports = {
    getProblemsByUserId,
    getProblemsBySessionId,
    getProblemById,
    logNewProblem,
    updateProblem,
    deleteProblem
};