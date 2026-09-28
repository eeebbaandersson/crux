const sessionService = require('../services/sessionService');


exports.getSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await sessionService.getAllSessions(userId);
        return res.json(sessions);
    } catch(error) {
        return res.status(500).json({ error: error.message});
    }
};

exports.getActiveSession = async (req, res) => {
    try {
        const { userId } = req.params;
        const session = await sessionService.getActiveSession(userId);

        if (!session) {
            return res.status(200).json({ active: false, message: 'No active session found.' });
        }

        return res.json({active: true, session});
    } catch(error) {
        return res.status(500).json({ error: error.message});
    }
};

exports.createSession = async (req, res) => {
    try {
        const { userId } = req.params;
        const { gym, climb_date } = req.body;

        if (!gym?.trim() || !climb_date) {
             return res.status(400).json({
                 error: 'Fields "gym" and "climb_date" need to be filled in.'
            });  
        }

        const newSession = await sessionService.createSession(userId, req.body);
        return res.status(201).json(newSession);
    } catch(error) {
        if (error.code === '23503') {
            return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(500).json({ error: error.message });
    }
};

exports.endSession = async (req, res) => {
    try {
        const { sessionId, userId } = req.params;
        const updatedSession = await sessionService.endSession(sessionId, userId );

         if (!updatedSession) {
            return res.status(404).json({ message: 'Session not found or unauthorized.'});
         }
         return res.json({ message: 'Session ended successfully.', session: updatedSession });
    } catch(error) {
        return res.status(500).json({ error: error.message});
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { sessionId, userId } = req.params;
        const isDeleted = await sessionService.deleteSession(sessionId, userId );

        if (!isDeleted) {
            return res.status(404).json({ message: 'Session not found or unauthorized.'});
        }

         return res.json({ message: 'Session has been deleted.'});
    } catch(error) {
        return res.status(500).json({ error: error.message });

    }
};