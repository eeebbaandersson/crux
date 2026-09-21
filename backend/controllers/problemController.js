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
        const newProblem = await problemService.logNewProblem(userId, req.body);
        return res.status(201).json(newProblem);
    } catch(error) {
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

