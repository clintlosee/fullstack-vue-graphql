import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';
import App from './App.vue';
import router from './router';
import store from './store';

import FormAlert from './components/Shared/FormAlert.vue';

//* Register Global Component
Vue.component('form-alert', FormAlert);

Vue.use(VueApollo);

//* Setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  //* include auth token with requests to backend
  fetchOptions: {
    credentials: 'include',
  },
  request: operation => {
    //* if no token, add one
    if (!localStorage.token) {
      localStorage.setItem('token', '');
    }

    //* operation adds the token to an authorization header
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token'),
      },
    });
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('[networkError]', networkError);
    }

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.dir(err);
        if (err.name === 'AuthenticationError') {
          //* set auth error in state
          store.commit('setAuthError', err);
          //* signout user (to clear token)
          store.dispatch('signoutUser');
        }
      }
    }
  },
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  provide: apolloProvider,
  router,
  store,
  render: h => h(App),
  created() {
    //* execute getCurrentUser query
    this.$store.dispatch('getCurrentUser');
  },
}).$mount('#app');
