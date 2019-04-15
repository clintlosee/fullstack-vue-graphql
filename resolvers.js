const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getPosts: async (parent, args, { Post }) => {
      const posts = Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: 'createdBy',
          model: 'User',
        });
      return posts;
    },
  },

  Mutation: {
    signinUser: async (parent, { username, password }, { User }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      return { token: createToken(user, process.env.SECRET, '1hr') };
    },

    signupUser: async (parent, { username, email, password }, { User }) => {
      const user = await User.findOne({ username });

      if (user) {
        throw new Error('User already exists');
      }

      const newUser = await new User({
        username,
        email,
        password,
      }).save();

      return { token: createToken(newUser, process.env.SECRET, '1hr') };
    },

    addPost: async (
      parent,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId,
      }).save();

      return newPost;
    },
  },
};
