import { gql } from 'apollo-boost';

//* Post queries
export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      imageUrl
    }
  }
`;

//* User queries

//* Post mutations

//* User mutations
