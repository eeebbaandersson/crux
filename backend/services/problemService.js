const db = require('../db.js');

// { rows } --> result object used in PostgreSQL
// $1 --> required number index for parameters
async function getAllProblems(userId) {
    const { rows } = await db.query('SELECT * FROM problems WHERE user_id = $1 ORDER BY climb_date DESC , id DESC',
        [userId]
    );
    console.log(rows);
    return rows;
}


async function getProblemById(id, userId) {
    const { rows }  = await db.query('SELECT * FROM problems WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0]; // returnerar första elementet i arrayen pga det unika ID:et
}

// RETURNING * --> make sure PostreSQL returns the data instead of empty [] as default when using INSERT-query
async function logNewProblem(userId, problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const { rows } = await db.query(
        `INSERT INTO problems (user_id, style, grade, tries, current_status, gym, climb_date, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [userId, style, grade, tries, current_status, gym, climb_date, notes]
    );
    return rows[0];  
}


async function updateProblem(id, userId, problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const { rows } = await db.query(`UPDATE problems SET style = $1, grade = $2, tries = $3, current_status = $4, gym = $5, climb_date = $6, notes = $7 
        WHERE id = $8 AND user_id = $9
        RETURNING *`,
        [style, grade, tries, current_status, gym, climb_date, notes, id, userId]
    );
    return rows[0];
}

// rowCount --> used to verify a deleted row (true/false)
async function deleteProblem(id, userId) {
    const { rowCount } = await db.query('DELETE FROM problems WHERE id = $1 AND user_id = $2', [id, userId]);
    return rowCount > 0;  
}

module.exports = {
    getAllProblems,
    getProblemById,
    logNewProblem,
    updateProblem,
    deleteProblem
};

