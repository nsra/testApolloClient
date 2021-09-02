const express = require('express');
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const mongoose = require('mongoose');
const { typeDefs } = require('./schemas/index.js');
const { authResolver } = require('./resolvers/auth');
const { bookingResolver } = require('./resolvers/booking');
const { eventResolver } = require('./resolvers/event');
const _ = require('lodash');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'f1BtnWgD3VKY';

async function startApolloServer() {
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: _.merge({}, authResolver, bookingResolver, eventResolver),
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth) {
        const decodedToken = jwt.verify(
          auth.split(' ')[1], JWT_SECRET
        );
        const user = await User.findById(decodedToken.id);
        if (!user) throw new AuthenticationError('you must be logged in');
        return { user };
      }
    }
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise(resolve => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

  mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.cnfkb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    err => {
      if (err) throw err;
      console.log('Connected successfully');
    });
  mongoose.set('useFindAndModify', false);

  return { server, app }
}
startApolloServer();
