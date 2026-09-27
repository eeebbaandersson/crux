const db = require('../db.js');

// { rows } --> result object used in PostgreSQL
// $1 --> required number index for parameters
async function getAllProblems(sessionId) {
    const { rows } = await db.query('SELECT * FROM problems WHERE session_id = $1 ORDER BY created_at DESC , id DESC',
        [sessionId]
    );
    console.log(rows);
    return rows;
}


async function getProblemById(id, sessionId) {
    const { rows }  = await db.query('SELECT * FROM problems WHERE id = $1 AND session_id = $2', [id, sessionId]);
    return rows[0]; // returnerar första elementet i arrayen pga det unika ID:et
}

// RETURNING * --> make sure PostreSQL returns the data instead of empty [] as default when using INSERT-query
async function logNewProblem(sessionId, problemData) {
    const { style, grade, tries, current_status, notes } = problemData;

    const { rows } = await db.query(
        `INSERT INTO problems (session_id, style, grade, tries, current_status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [sessionId, style, grade, tries, current_status, notes]
    );
    return rows[0];  
}


async function updateProblem(id, sessionId, problemData) {
    const { style, grade, tries, current_status, notes } = problemData;

    const { rows } = await db.query(`UPDATE problems SET style = $1, grade = $2, tries = $3, current_status = $4, notes = $5 
        WHERE id = $6 AND session_id = $7
        RETURNING *`,
        [style, grade, tries, current_status, notes, id, sessionId]
    );
    return rows[0];
}

// rowCount --> used to verify a deleted row (true/false)
async function deleteProblem(id, sessionId) {
    const { rowCount } = await db.query('DELETE FROM problems WHERE id = $1 AND session_id = $2', [id, sessionId]);
    return rowCount > 0;  
}

module.exports = {
    getAllProblems,
    getProblemById,
    logNewProblem,
    updateProblem,
    deleteProblem
};

