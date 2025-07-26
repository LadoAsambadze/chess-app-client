// hooks/useAuthMutations.ts
import { useMutation, gql } from '@apollo/client';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../containers/AuthContext/AuthContext';

// GraphQL mutations - adjust these based on your actual schema
const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupRequest!) {
    signup(signupRequest: $input) {
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

const SIGNIN_MUTATION = gql`
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

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
    }
  }
`;

export const useAuthMutations = () => {
  const { login, logout, updateAccessToken } = useAuth();
  const navigate = useNavigate();

  const [signupMutation, { loading: signupLoading }] =
    useMutation(SIGNUP_MUTATION);
  const [signinMutation, { loading: signinLoading }] =
    useMutation(SIGNIN_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  const signup = async (userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    phone?: string;
    avatar?: string;
  }) => {
    try {
      const { data } = await signupMutation({
        variables: { input: userData },
      });

      if (data?.signup) {
        login(data.signup.user, data.signup.accessToken);
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Signup failed',
      };
    }
  };

  const signin = async (credentials: { email: string; password: string }) => {
    try {
      const { data } = await signinMutation({
        variables: { signinInput: credentials }, // ✅ fixed
      });

      if (data?.signin) {
        login(data.signin.user, data.signin.accessToken);
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Signin failed',
      };
    }
  };

  const refreshToken = async () => {
    try {
      const { data } = await refreshTokenMutation();
      if (data?.refreshToken?.accessToken) {
        updateAccessToken(data.refreshToken.accessToken);
        return { success: true };
      }
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    signup,
    signin,
    refreshToken,
    logout: handleLogout,
    isLoading: signupLoading || signinLoading,
  };
};
