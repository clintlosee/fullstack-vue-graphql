<template>
  <v-app style="background: #E3E3E3;">
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">VueShare</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Side Navbar Links -->
      <v-list>
        <v-list-tile
          ripple
          v-for="item in sideNavItems"
          :key="item.title"
          :to="item.link"
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            {{ item.title }}
          </v-list-tile-content>
        </v-list-tile>

        <!-- Signout Button -->
        <v-list-tile v-if="user" @click="handleSignoutUser">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Signout</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- Horizontal Navbar -->
    <v-toolbar fixed color="secondary" dark>
      <!-- App Title -->
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">
          VueShare
        </router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Input -->
      <v-text-field
        flex
        prepend-icon="search"
        placeholder="Search posts"
        color="accent"
        single-line
        hide-details
        v-model="searchTerm"
        @input="handleSearchPosts"
      ></v-text-field>

      <!-- Search Results Card -->
      <v-card id="search__card" dark v-if="searchResults.length">
        <v-list>
          <v-list-tile
            @click="goToSearchResult(result._id)"
            v-for="result in searchResults"
            :key="result._id"
          >
            <v-list-tile-title>
              {{ result.title }} -
              <span class="font-weight-thin">
                {{ formatDescription(result.description) }}
              </span>
            </v-list-tile-title>

            <!-- Show icon if favorited -->
            <v-list-tile-action v-if="checkIfUserFavorite(result._id)">
              <v-icon>favorite</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>

      <v-spacer></v-spacer>

      <!-- Horizontal Navbar Links -->

      <v-toolbar-items class="hidden-xs-only">
        <v-btn
          flat
          v-for="item in horizontalNavItems"
          :key="item.title"
          :to="item.link"
        >
          <v-icon class="hidden-sm-only" left>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>

        <!-- Profile Button -->
        <v-btn flat to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge
            right
            color="blue darken-2"
            :class="{ bounce: badgeAnimated }"
          >
            <span slot="badge" v-if="userFavorites.length">
              {{ userFavorites.length }}
            </span>
            Profile
          </v-badge>
        </v-btn>

        <!-- Signout Button -->
        <v-btn flat v-if="user" @click="handleSignoutUser">
          <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>
          Signout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <!-- App content -->
    <main>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view />
        </transition>

        <!-- Auth Snackbar -->
        <v-snackbar
          v-model="authSnackbar"
          color="success"
          :timeout="5000"
          bottom
          left
        >
          <v-icon class="mr-3">check_circle</v-icon>
          <h3>You are now signed in!</h3>
          <v-btn dark flat @click="authSnackbar = false">Close</v-btn>
        </v-snackbar>

        <!-- AuthError Snackbar -->
        <v-snackbar
          v-model="authErrorSnackbar"
          v-if="authError"
          color="info"
          :timeout="5000"
          bottom
          left
        >
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{ authError.message }}</h3>
          <v-btn dark flat to="/signin">Signin</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import { setTimeout } from 'timers';

export default {
  name: 'App',

  data() {
    return {
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      badgeAnimated: false,
      searchTerm: ''
    };
  },

  methods: {
    toggleSideNav() {
      this.sideNav = !this.sideNav;
    },

    handleSignoutUser() {
      this.$store.dispatch('signoutUser');
    },

    handleSearchPosts() {
      this.$store.dispatch('searchPosts', {
        searchTerm: this.searchTerm
      });
    },

    goToSearchResult(resultId) {
      //* clear the search term
      this.searchTerm = '';
      //* go to the desired result
      this.$router.push(`/posts/${resultId}`);
      //* clear the search results
      this.$store.commit('clearSearchResults');
    },

    formatDescription(desc) {
      return desc.length > 30 ? `${desc.slice(0, 30)}...` : desc;
    },

    checkIfUserFavorite(resultId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === resultId)
      );
    }
  },

  watch: {
    user(newVal, oldVal) {
      if (oldVal === null) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      if (value !== null) {
        this.authErrorSnackbar = true;
      }
    },
    userFavorites(value) {
      this.badgeAnimated = true;
      setTimeout(() => (this.badgeAnimated = false), 1000);
    }
  },

  computed: {
    ...mapGetters({
      user: 'user',
      userFavorites: 'userFavorites',
      loading: 'loading',
      authError: 'authError',
      searchResults: 'searchResults'
    }),

    horizontalNavItems() {
      let items = [
        { icon: 'chat', title: 'Posts', link: '/posts' },
        { icon: 'lock_open', title: 'Sign In', link: '/signin' },
        { icon: 'create', title: 'Sign Up', link: '/signup' }
      ];

      if (this.user) {
        items = [{ icon: 'chat', title: 'Posts', link: '/posts' }];
      }

      return items;
    },
    sideNavItems() {
      let items = [
        { icon: 'chat', title: 'Posts', link: '/posts' },
        { icon: 'lock_open', title: 'Sign In', link: '/signin' },
        { icon: 'create', title: 'Sign Up', link: '/signup' }
      ];

      if (this.user) {
        items = [
          { icon: 'chat', title: 'Posts', link: '/posts' },
          { icon: 'stars', title: 'Create Post', link: '/post/add' },
          { icon: 'account_box', title: 'Profile', link: '/profile' }
        ];
      }

      return items;
    }
  }
};
</script>

<style>
h1 {
  font-weight: 400;
  font-size: 2.5rem;
}

h2 {
  font-weight: 400;
  font-size: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Search Results Card */
#search__card {
  position: absolute;
  width: 100vw;
  z-index: 8;
  top: 100%;
  left: 0%;
}

/* User Favorite Animation */
.bounce {
  animation: bounce 1s both;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }

  70% {
    transform: translate3d(0, -10px, 0);
  }

  90% {
    transform: translate3d(0, -4px, 0);
  }
}
</style>
