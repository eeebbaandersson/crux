const problemService = require('../services/problemService');

exports.getProblems = async (req, res) => {
    try {
        const { sessionId, userId } = req.params;

        if (sessionId) {
            const problems = await problemService.getProblemsBySessionId(sessionId);
            return res.json(problems);
        } 
        
        if (userId) {
            const problems = await problemService.getProblemsByUserId(userId);
            return res.json(problems);
        }

        return res.status(400).json({ error: 'Minst sessionId eller userId krävs.' });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Kunde inte hämta problem.' });
    }
};

exports.createProblem = async (req, res) => {
    try {
        const { sessionId, userId } = req.params;
        const { style, grade } = req.body;

        if (!style?.trim() || !grade?.trim()) {
            return res.status(400).json({
                 error: 'Fields "style" and "grade" need to be filled in.'
            });  
        }
        const newProblem = await problemService.logNewProblem({ sessionId, userId}, req.body);
        return res.status(201).json(newProblem);
    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({ error: 'Session not found.' });
        }
        return res.status(500).json({ error: error.message });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { sessionId, userId, id } = req.params;
        const problem = await problemService.getProblemById(id, { sessionId, userId });

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.' });
        }
        return res.json(problem);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.updateProblem = async (req, res) => {
    try {
        const { sessionId, userId, id } = req.params;
        const problemData = req.body;
        const { style, grade } = problemData;

        if (!style?.trim() || !grade?.trim()) {
            return res.status(400).json({
                error: 'Fields "style" and "grade" cannot be empty.'
            });
        }

        // Skicka med både id, sessionId/userId och datan till servicen
        const updatedProblem = await problemService.updateProblem(id, { sessionId, userId }, problemData);

        if (!updatedProblem) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.' });
        } 

        return res.json({ message: 'Problem has been updated.', result: updatedProblem });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const { sessionId, userId, id } = req.params;
        const isDeleted = await problemService.deleteProblem(id, { sessionId, userId });

        if (!isDeleted) {
            return res.status(404).json({ message: 'Problem not found or unauthorized.' });
        }

        return res.json({ message: 'Problem has been deleted.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};