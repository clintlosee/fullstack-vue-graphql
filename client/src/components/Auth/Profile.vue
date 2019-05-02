<template>
  <v-container>
    <!-- User Details Card -->
    <v-flex sm6 offset-sm3>
      <v-card class="white-text" color="primary">
        <v-layout>
          <v-flex xs5>
            <v-img height="125px" contain :src="user.avatar"></v-img>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{ user.username }}</div>
                <div>Joined {{ user.joinDate }}</div>
                <div class="hidden-xs-only font-weight-regular white--text">
                  {{ user.favorites.length }} Favorites
                </div>
                <div class="hidden-xs-only font-weight-regular white--text">
                  2 Posts Added
                </div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>

    <!-- Posts Favorited By User -->
    <v-container v-if="!userFavorites.length">
      <v-layout row wrap>
        <v-flex xs12>
          <h2>You have no favorites currently. Go add some!</h2>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container class="mt-3" v-else>
      <v-flex xs12 class="text-xs-center">
        <h2 class="font-weight-light">
          Favorited
          <span class="font-weight-regular">{{ userFavorites.length }}</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="favorite in userFavorites" :key="favorite._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-img height="30vh" :src="favorite.imageUrl"></v-img>
            <v-card-text>{{ favorite.title }}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';

export default {
  name: 'Profile',
  computed: {
    ...mapGetters(['user', 'userFavorites'])
  }
};
</script>

<style lang="scss" scoped></style>
