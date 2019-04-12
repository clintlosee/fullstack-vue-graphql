<template>
  <v-container text-xs-center v-if="getPosts">
    <v-flex xs12>
      <v-carousel v-bind="{ cycle: true }" interval="3000">
        <v-carousel-item
          v-for="post in getPosts"
          :key="post._id"
          :src="post.imageUrl"
        >
          <h1 id="carousel__title">{{ post.title }}</h1>
        </v-carousel-item>
      </v-carousel>
    </v-flex>

    <!-- <h1>Home</h1>
    <div v-if="$apollo.loading">Loading...</div>
    <ul v-else v-for="post in getPosts" :key="post._id">
      <li>{{ post.title }}</li>
      <li>{{ post.imageUrl }}</li>
      <li>{{ post.description }}</li>
    </ul>

    <v-divider></v-divider>

    <ApolloQuery :query="getPostsQuery">
      <template slot-scope="{ result: { loading, error, data } }">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">ERROR {{ error.message }}</div>
        <ul v-else v-for="post in data.getPosts" :key="post._id">
          <li>{{ post.title }}</li>
          <li>{{ post.imageUrl }}</li>
          <li>{{ post.description }}</li>
        </ul>
      </template>
    </ApolloQuery> -->
  </v-container>
</template>

<script>
import { gql } from "apollo-boost";

export default {
  name: "home",
  components: {},
  data() {
    return {
      posts: [],
      getPostsQuery: gql`
        query {
          getPosts {
            _id
            title
            imageUrl
            categories
            description
            createdDate
            likes
            createdBy {
              _id
              username
              email
              password
              joinDate
            }
          }
        }
      `
    };
  },
  apollo: {
    getPosts: {
      query: gql`
        query {
          getPosts {
            _id
            title
            imageUrl
            categories
            description
            createdDate
            likes
            createdBy {
              _id
              username
              email
              password
              joinDate
            }
          }
        }
      `,
      result({ data, loading }) {
        if (!loading) {
          this.posts = data.getPosts;
        }
      },
      error(err) {
        console.log("ERROR:", err);
      }
    }
  }
};
</script>

<style>
#carousel__title {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 5px 5px 0 0;
  padding: 0.5em;
  margin: 0 auto;
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>