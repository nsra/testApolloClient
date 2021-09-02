const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authResolver = {
    Query: {
        login: async (_, { email, password }) => {
            console.log('here');
            const user = await User.findOne({ email: email });
            if (!user) {
                throw new Error('User does not exist!');
            }
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                throw new Error('Invalid credentials');
            }
            const userForToken = {
                email: user.email,
                id: user._id,
            }
            return { userId: user._id, token: jwt.sign(userForToken, 'f1BtnWgD3VKY') }
        }
    },
    Mutation: {
        createUser: async (_, args) => {
            try {
                const existingUser = await User.findOne({ email: args.userInput.email });
                if (existingUser) {
                    throw new Error('User already exists.');
                }
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

                const user = new User({
                    username: args.userInput.username,
                    email: args.userInput.email,
                    password: hashedPassword
                });

                const result = await user.save();

                return user;
            } catch (err) {
                throw err;
            }
        }
    }
};

module.exports = { authResolver };
