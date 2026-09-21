const userService = require('../services/userService');

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.'});
        }

        // removes password hash before sending answer to frontend
        const { password_hash, ...safeUser } = user;
        return res.status(200).json(safeUser);
    } catch (error) {
        console.error('Error while retrieving user:', error);
        return res.status(500).json({ error: 'A server error occurred.'});
    }
}

exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await userService.updateUserInfo(id, req.body);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.'});
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error while updating userprofile:', error);
        return res.status(500).json({ error: 'A server error occurred.'})
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await userService.deleteUser(id);

        if (!deleted) {
            return res.status(404).json({ error: 'User not found.'});
        }
        return res.status(200).json({ message: 'Useraccount has been deleted.'});
    } catch (error) {
        console.error('Error while deleting user.', error);
        return res.status(500).json({ error: 'A server error occurred.'});
    }
}