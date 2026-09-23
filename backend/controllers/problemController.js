const problemService = require('../services/problemService');

// exports. --> För att slippa lista/exportera allt längst ner i filen med module.exports = {}
exports.getProblems = async (req, res) => {
    try {
        const { userId } = req.params;
        const problems = await problemService.getAllProblems(userId);
        res.json(problems);
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createProblem = async (req, res) => {
    try {
        // req.body --> Innehåller objektet med alla nödvändiga fält
        const { userId } = req.params;
        const { style, grade, gym, climb_date } = req.body;

        if (!style?.trim() || !grade?.trim() || !gym?.trim() || !climb_date) {
            return res.status(400).json({
                 error: 'Fields "style", "grade", "gym" and "climb_date" need to be filled in.'
            });  
        }
        const newProblem = await problemService.logNewProblem(userId, req.body);
        return res.status(201).json(newProblem);
    } catch(error) {
        // I user in the URL is not found in database (Foreign Key violation)
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found.'});
        }
        return res.status(500).json({ error: error.message });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { userId, id } = req.params; // Plockar ut :id från URL:en
        const problem = await problemService.getProblemById(id, userId);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.'});
        }
        return res.json(problem);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateProblem = async (req, res) => {
    try {
        const { userId, id } = req.params;
        const problemData = req.body;
        const { style, grade, gym, climb_date } = problemData;

        if (!style?.trim() || !grade?.trim() || !gym?.trim() || !climb_date) {
            return res.status(400).json({
                error: 'Fields "style", "grade", "gym" and "climb_date" cannot be empty.'
            });
        }
        const updateProblem = await problemService.updateProblem(id, userId, problemData);

        if (!updateProblem) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.'});
        } 

        return res.json({ message: 'Problem has been updated.', result: updateProblem });
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const { userId, id } = req.params;
        const isDeleted = await problemService.deleteProblem(id, userId);

        if (!isDeleted) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.'});
        }

        return res.json({ message: 'Problem has been deleted.'});
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

