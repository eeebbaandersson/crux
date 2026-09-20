const db = require('../db.js');

// { rows } --> result object used in PostgreSQL
// $1 --> required number index for parameters
async function getAllProblems() {
    const { rows } = await db.query('SELECT * FROM problems ORDER BY climb_date DESC , id DESC');
    console.log(rows);
    return rows;
}


async function getProblemById(id) {
    const { rows }  = await db.query('SELECT * FROM problems WHERE id = $1', [id]);
    return rows[0]; // returnerar första elementet i arrayen pga det unika ID:et
}

// RETURNING * --> make sure PostreSQL returns the data instead of empty [] as default when using INSERT-query
async function logNewProblem(problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const { rows } = await db.query(
        `INSERT INTO problems (style, grade, tries, current_status, gym, climb_date, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [style, grade, tries, current_status, gym, climb_date, notes]
    );
    return rows[0];  
}


async function updateProblem(id, problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const { rows } = await db.query(`UPDATE problems SET style = $1, grade = $2, tries = $3, current_status = $4, gym = $5, climb_date = $6, notes = $7 
        WHERE id = $8
        RETURNING *`,
        [style, grade, tries, current_status, gym, climb_date, notes, id]
    );
    return rows[0];
}

// rowCount --> used to verify a deleted row (true/false)
async function deleteProblem(id) {
    const { rowCount } = await db.query('DELETE FROM problems WHERE id = $1', [id]);
    return rowCount > 0;  
}

module.exports = {
    getAllProblems,
    getProblemById,
    logNewProblem,
    updateProblem,
    deleteProblem
};

