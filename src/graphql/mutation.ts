import { gql } from '@apollo/client';

export const SIGNIN_MUTATION = gql`
  mutation Signin($signinInput: SigninRequest!) {
    signin(signinInput: $signinInput) {
      user {
        id
        email
        firstname
        lastname
        avatar
        role
      }
      accessToken
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($signupInput: SignupRequest!) {
    signup(signupInput: $signupInput) {
      user {
        id
        email
        firstname
        lastname
        avatar
        role
      }
      accessToken
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshAccessToken {
    refreshAccessToken {
      accessToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

// Optional: Query to get current user info
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstname
      lastname
      avatar
      role
    }
  }
`;
