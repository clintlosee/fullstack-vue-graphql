import Vue from 'vue';
import Router from 'vue-router';

//* Code splitting import components
const Home = () =>
  import(/* webpackChunkName: "home" */ '@/components/Home.vue');

const AddPost = () =>
  import(/* webpackChunkName: "addPost" */ '@/components/Posts/AddPost.vue');
const Posts = () =>
  import(/* webpackChunkName: "posts" */ '@/components/Posts/Posts.vue');

const Profile = () =>
  import(/* webpackChunkName: "profile" */ '@/components/Auth/Profile.vue');
const Signin = () =>
  import(/* webpackChunkName: "signin" */ '@/components/Auth/Signin.vue');
const Signup = () =>
  import(/* webpackChunkName: "signup" */ '@/components/Auth/Signup.vue');

Vue.use(Router);

export default new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/posts',
      name: 'Posts',
      component: Posts,
    },
    {
      path: '/post/add',
      name: 'AddPost',
      component: AddPost,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
    },
    {
      path: '/signin',
      name: 'Signin',
      component: Signin,
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () =>
    //     import(/* webpackChunkName: "about" */ './views/About.vue'),
    // },
  ],
});
