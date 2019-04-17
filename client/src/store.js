import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';

import { defaultClient as apolloClient } from './main';
import { GET_POSTS, SIGNIN_USER, GET_CURRENT_USER } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    user: null,
    loading: false,
    error: null,
  },

  getters: {
    posts: state => state.posts,
    user: state => state.user,
    loading: state => state.loading,
    error: state => state.error,
  },

  mutations: {
    setPosts(state, payload) {
      state.posts = payload;
    },

    setUser(state, payload) {
      state.user = payload;
    },

    setLoading(state, payload) {
      state.loading = payload;
    },

    setError(state, payload) {
      state.error = payload;
    },

    clearUser(state) {
      state.user = null;
    },

    clearError(state) {
      state.error = null;
    },
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

    signinUser: ({ commit }, payload) => {
      commit('clearError');
      commit('setLoading', true);
      localStorage.setItem('token', '');

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
