<template>
  <v-container fluid grid-list-xl>
    <!-- Post Cards -->
    <v-layout row wrap v-if="infiniteScrollPosts">
      <v-flex
        xs12
        sm6
        v-for="post in infiniteScrollPosts.posts"
        :key="post._id"
      >
        <v-card hover>
          <v-img
            @click.native="goToPost(post._id)"
            :src="post.imageUrl"
            height="30vh"
            lazy
          ></v-img>

          <v-card-actions>
            <v-card-title primary>
              <div>
                <div @click="goToPost(post._id)" class="headline">
                  {{ post.title }}
                </div>
                <span class="grey--text">
                  {{ post.likes }} likes - {{ post.messages.length }} Comments
                </span>
              </div>
            </v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="showPostCreator = !showPostCreator" icon>
              <v-icon>
                {{ `keyboard_arrow_${showPostCreator ? 'up' : 'down'}` }}
              </v-icon>
            </v-btn>
          </v-card-actions>

          <!-- Post Creator Title -->
          <v-slide-y-transition>
            <v-card-text v-show="showPostCreator" class="grey lighten-4">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img :src="post.createdBy.avatar" alt="Avatar" />
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title class="text--primary">
                    {{ post.createdBy.username }}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class="font-weight-thin">
                    Added {{ formatCreatedDate(post.createdDate) }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-btn icon ripple>
                    <v-icon color="info">info</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-card-text>
          </v-slide-y-transition>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- Fetch More Btn -->
    <v-layout column v-if="showMoreEnabled">
      <v-flex xs12>
        <v-layout justify-center row>
          <v-btn color="accent" @click="showMorePosts">Fetch More</v-btn>
          <!-- <v-btn color="info" class="black--text" @click="showMorePosts"
            >Fetch More
          </v-btn> -->
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import moment from 'moment';
import { INFINITE_SCROLL_POSTS } from '../../queries';

const pageSize = 2;

export default {
  name: 'Posts',
  data() {
    return {
      pageNum: 1,
      // showMoreEnabled: true,
      showPostCreator: false
    };
  },
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize
      }
    }
  },

  computed: {
    showMoreEnabled() {
      return this.infiniteScrollPosts && this.infiniteScrollPosts.hasMore;
    }
  },

  methods: {
    formatCreatedDate(date) {
      return moment(new Date(date)).format('ll');
    },

    showMorePosts() {
      this.pageNum += 1;
      // fetch more data and transform original result
      this.$apollo.queries.infiniteScrollPosts.fetchMore({
        variables: {
          // pageNum incremented by 1
          pageNum: this.pageNum,
          pageSize
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          const newPosts = fetchMoreResult.infiniteScrollPosts.posts;
          const hasMore = fetchMoreResult.infiniteScrollPosts.hasMore;
          // this.showMoreEnabled = hasMore;

          return {
            infiniteScrollPosts: {
              __typename: prevResult.infiniteScrollPosts.__typename,
              // Merge previous posts with new posts
              posts: [...prevResult.infiniteScrollPosts.posts, ...newPosts],
              hasMore
            }
          };
        }
      });
    },

    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    }
  }
};
</script>

<style scoped></style>
