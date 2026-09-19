const db = require('../db.js');

async function getAllProblems() {
    const [rows] = await db.query('SELECT * FROM problems');
    console.log(rows);
    return rows;
}


async function getProblemById(id) {
    const [result] = await db.query('SELECT * FROM problems WHERE id = ?', [id]);
    return result[0]; // returnerar första elementet i arrayen pga det unika ID:et
}


async function logNewProblem(problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const [result] = await db.query(
        'INSERT INTO problems (style, grade, tries, current_status, gym, climb_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [style, grade, tries, current_status, gym, climb_date, notes]
    );
    return result;  
}


async function updatedCurrentProblem(id, problemData) {
    const { style, grade, tries, current_status, gym, climb_date, notes } = problemData;

    const [result] = await db.query('UPDATE problems SET style = ?, grade = ?, tries = ?, current_status = ?, gym = ?, climb_date = ?, notes = ? WHERE id = ?',
        [style, grade, tries, current_status, gym, climb_date, notes, id]
    );
        return result;
}


async function deleteProblem(id) {
    const [result] = await db.query('DELETE FROM problems WHERE id = ?', [id]

    );
     return result;  
}

module.exports = {
    getAllProblems,
    getProblemById,
    logNewProblem,
    updatedCurrentProblem,
    deleteProblem
};

