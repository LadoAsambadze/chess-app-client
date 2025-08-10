import { gql } from '@apollo/client';

export const SIGNIN_MUTATION = gql`
  mutation Signin($signinInput: SigninRequest!) {
    signin(signinInput: $signinInput) {
      accessToken
      user {
        avatar
        createdAt
        email
        firstname
        id
        isActive
        isVerified
        lastLogin
        lastname
        method
        phone
        role
        updatedAt
      }
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
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      user {
        avatar
        createdAt
        email
        firstname
        id
        isActive
        isVerified
        lastLogin
        lastname
        method
        phone
        role
        updatedAt
      }
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

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstname
      lastname
      avatar
      role
      isActive
      isVerified
    }
  }
`;
