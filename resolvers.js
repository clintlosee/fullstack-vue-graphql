const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (parent, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      }

      const user = await User.findOne({
        username: currentUser.username,
      }).populate({
        path: 'favorites',
        model: 'Post',
      });

      return user;
    },

    getPosts: async (parent, args, { Post }) => {
      const posts = Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: 'createdBy',
          model: 'User',
        });
      return posts;
    },

    getPost: async (parent, { postId }, { Post }) => {
      const post = Post.findOne({ _id: postId }).populate({
        path: 'messages.messageUser',
        model: 'User',
      });
      return post;
    },

    getUserPosts: async (parent, { userId }, { Post }) => {
      const posts = await Post.find({
        createdBy: userId,
      });
      return posts;
    },

    searchPosts: async (parent, { searchTerm }, { Post }) => {
      if (searchTerm) {
        const searchResults = Post.find(
          //* Perform text search for search value of 'searchTerm'
          { $text: { $search: searchTerm } },
          //* Assign 'searchTerm' a text score to provide best match
          { score: { $meta: 'textScore' } }
          //* Sort results according to that textScore as well as likes in desc order
        )
          .sort({
            score: { $meta: 'textScore' },
            likes: 'desc',
          })
          .limit(5);
        return searchResults;
      }
    },

    infiniteScrollPosts: async (parent, { pageNum, pageSize }, { Post }) => {
      let posts;
      if (pageNum === 1) {
        posts = await Post.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User',
          })
          .limit(pageSize);
      } else {
        // If page number is greater than one, figure out how many documents to skip
        const skips = pageSize * (pageNum - 1);
        posts = await Post.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User',
          })
          .skip(skips)
          .limit(pageSize);
      }
      const totalDocs = await Post.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    },
  },

  Mutation: {
    addPostMessage: async (
      parent,
      { messageBody, userId, postId },
      { Post }
    ) => {
      const newMessage = {
        messageBody,
        messageUser: userId,
      };
      const post = await Post.findOneAndUpdate(
        //* first find post by id
        { _id: postId },
        //* prepend new message to beginning of messages array
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        //* return fresh document after update
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User',
      });

      return post.messages[0];
    },

    likePost: async (parent, { postId, username }, { Post, User }) => {
      //* Find Post, add 1 to its 'like value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );

      //* Find User, add id of post to its favorites array, which will be populated as Posts
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post',
      });

      //* Return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites };
    },

    unlikePost: async (parent, { postId, username }, { Post, User }) => {
      //* Find Post, add 1 to its 'like value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      );

      //* Find User, remove id of post to its favorites array, which will be populated as Posts
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post',
      });

      //* Return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites };
    },

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
