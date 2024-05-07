// import models and utils functions
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findOne({
          _id: context.user._id
        });
        return user;
      }

      throw AuthenticationError;
    }
  },
  Mutation: {
    // login mutation
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw AuthenticationError;
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { username, email, password}) => {
      const user = User.create({ username, email, password });
      const token = signToken(user);
      return { token, user }
  },
  saveBook: async (parent, { bookData }, context) => {
    const {
      bookId,
      authors,
      description,
      title, 
      image,
      link
    } = bookData;

    const user = await User.findOneAndUpdate(
      { _id: context.user._id },
      { $addToSet: { savedBooks: bookData } },
      { new: true }
    );

    return user;   
  },
  removeBook: async (parent, { bookId }, context) => {
    const user = await User.findOneAndUpdate(
      { _id: context.user._id },
      { $pull: { savedBooks: { bookId } } },
      { new: true }
    );

    return user;
  } 
}
};

module.exports = resolvers;