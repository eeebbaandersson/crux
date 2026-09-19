const problemService = require('../services/problemService');

// exports. --> För att slippa lista/exportera allt längst ner i filen med module.exports = {}
exports.getProblems = async (req, res) => {
    try {
        const problems = await problemService.getAllProblems();
        res.json(problems);
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createProblem = async (req, res) => {
    try {
        // req.body --> Innehåller objektet med alla nödvändiga fält
        const newProblem = await problemService.logNewProblem(req.body);
        return res.status(201).json(newProblem);
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { id } = req.params; // Plockar ut :id från URL:en
        const problem = await problemService.getProblemById(id);

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found.'});
        }
        return res.json(problem);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problemData = req.body;
        const result = await problemService.updateProblem(id, problemData);

        return res.json({ message: 'Problem has been updated.', result });
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        await problemService.deleteProblem(id);

        return res.json({ message: 'Problem has been deleted.'});
    } catch(error) {
        return res.status(500).json({ error: error.message });
    }
};

