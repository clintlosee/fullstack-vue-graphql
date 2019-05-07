import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';

import { defaultClient as apolloClient } from './main';
import {
  GET_POSTS,
  ADD_POST,
  SIGNIN_USER,
  SIGNUP_USER,
  GET_CURRENT_USER,
  SEARCH_POSTS,
  GET_USER_POSTS,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  INFINITE_SCROLL_POSTS,
} from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    userPosts: [],
    searchResults: [],
    user: null,
    loading: false,
    authError: null,
    error: null,
  },

  getters: {
    posts: state => state.posts,
    userPosts: state => state.userPosts,
    searchResults: state => state.searchResults,
    user: state => state.user,
    userFavorites: state => state.user && state.user.favorites,
    loading: state => state.loading,
    authError: state => state.authError,
    error: state => state.error,
  },

  mutations: {
    setPosts(state, payload) {
      state.posts = payload;
    },

    setSearchResults(state, payload) {
      if (payload !== null) {
        state.searchResults = payload;
      } else {
        state.searchResults = [];
      }
    },

    setUser(state, payload) {
      state.user = payload;
    },

    setUserPosts(state, payload) {
      state.userPosts = payload;
    },

    setLoading(state, payload) {
      state.loading = payload;
    },

    setError(state, payload) {
      state.error = payload;
    },

    setAuthError(state, payload) {
      state.authError = payload;
    },

    clearUser: state => (state.user = null),

    clearError: state => (state.error = null),

    clearSearchResults: state => (state.searchResults = []),
  },

  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true);
      apolloClient
        .query({
          query: GET_CURRENT_USER,
        })
        .then(({ data }) => {
          commit('setLoading', false);
          commit('setUser', data.getCurrentUser);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error('GETCURRENTUSER ERROR:', err);
        });
    },

    getPosts: ({ commit }) => {
      commit('setLoading', true);

      //* use apolloClient to getPosts
      apolloClient
        .query({
          query: GET_POSTS,
        })
        .then(({ data }) => {
          //* get data from actions to state via mutations
          commit('setPosts', data.getPosts);
          commit('setLoading', false);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },

    getUserPosts: ({ commit }, payload) => {
      apolloClient
        .query({
          query: GET_USER_POSTS,
          variables: payload,
        })
        .then(({ data }) => {
          commit('setUserPosts', data.getUserPosts);
        })
        .catch(err => console.error(err));
    },

    searchPosts: ({ commit }, payload) => {
      apolloClient
        .query({
          query: SEARCH_POSTS,
          variables: payload,
        })
        .then(({ data }) => {
          commit('setSearchResults', data.searchPosts);
          console.log(data.searchPosts);
        })
        .catch(err => console.error(err));
    },

    addPost: ({ commit }, payload) => {
      commit('setLoading', true);

      apolloClient
        .mutate({
          mutation: ADD_POST,
          variables: payload,
          update: (cache, { data: { addPost } }) => {
            //* First read the query you want to update
            const data = cache.readQuery({ query: GET_POSTS });
            //* Create updated data
            data.getPosts.unshift(addPost);
            //* Write updated data back to cached query
            cache.writeQuery({
              query: GET_POSTS,
              data,
            });
          },
          //* Optimistic response ensures data is added immediately
          optimisticResponse: {
            __typename: 'Mutation',
            addPost: {
              __typename: 'Post',
              _id: -1,
              ...payload,
            },
          },
          //* Rerun specified queries after performing the mutation in order to get fresh data
          refetchQueries: [
            {
              query: INFINITE_SCROLL_POSTS,
              variables: {
                pageNum: 1,
                pageSize: 2,
              },
            },
          ],
        })
        .then(({ data }) => {
          commit('setLoading', false);
        })
        .catch(err => {
          commit('setLoading', false);
          console.err(err);
        });
    },

    updateUserPost: ({ state, commit }, payload) => {
      apolloClient
        .mutate({
          mutation: UPDATE_USER_POST,
          variables: payload,
        })
        .then(({ data }) => {
          const index = state.userPosts.findIndex(
            post => post._id === data.updateUserPost._id
          );
          const userPosts = [
            ...state.userPosts.slice(0, index),
            data.updateUserPost,
            ...state.userPosts.slice(index + 1),
          ];
          commit('setUserPosts', userPosts);
        })
        .catch(err => console.error(err));
    },

    deleteUserPost: ({ state, commit }, payload) => {
      apolloClient
        .mutate({
          mutation: DELETE_USER_POST,
          variables: payload,
        })
        .then(({ data }) => {
          const index = state.userPosts.findIndex(
            post => post._id === data.deleteUserPost._id
          );
          const userPosts = [
            ...state.userPosts.slice(0, index),
            data.deleteUserPost,
            ...state.userPosts.slice(index + 1),
          ];
          commit('setUserPosts', userPosts);
        })
        .catch(err => console.error(err));
    },

    signinUser: ({ commit }, payload) => {
      commit('clearError');
      commit('setLoading', true);

      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload,
        })
        .then(({ data }) => {
          commit('setLoading', false);
          localStorage.setItem('token', data.signinUser.token);

          //* to make sure created method is run in main.js (we run getCurrentUser), reload page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err);
          console.error(err);
        });
    },

    signupUser: ({ commit }, payload) => {
      commit('clearError');
      commit('setLoading', true);

      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload,
        })
        .then(({ data }) => {
          commit('setLoading', false);
          localStorage.setItem('token', data.signupUser.token);

          //* to make sure created method is run in main.js (we run getCurrentUser), reload page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err);
          console.error(err);
        });
    },

    signoutUser: async ({ commit }) => {
      commit('setLoading', true);

      //* clear user in state
      commit('clearUser', null);

      //* remove token in localStorage
      localStorage.setItem('token', '');
      // localStorage.removeItem('token');

      //* end session
      await apolloClient.resetStore();

      //* redirect home - kick users out of private pages (i.e. profile)
      router.push('/');

      commit('setLoading', false);
    },
  },
});
