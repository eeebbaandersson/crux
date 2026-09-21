const userService = require('../services/userService');


exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // validate that all fields are filled in
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields need to be filled in.'});
        }

        // Validate that username is not already taken
        const existingUser = await userService.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken.'});
        }

        const newUser = await userService.createUser(username, email, password);
        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error during registration.', error);
        return res.status(500).json({ error: 'A server error occurred during registration.'});
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password is required.'});
        }

        // Get user from db
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Wrong username or password.'});
        }

        // Compare password againt hashed one
        const isPasswordValid = await userService.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Wrong username or password.'});
        }

        // Remove password_hash before sending answer to frontend
        const { password_hash, ...safeUserData } = user;

        return res.status(200).json({
            message: 'Login successfully!',
            user: safeUserData
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'A server error occurred during login '})
    }
}