import store from './src/store';

export default (to, from, next) => {
  if (!store.getters.user) {
    next({
      path: '/signin',
    });
  } else {
    next();
  }
};
