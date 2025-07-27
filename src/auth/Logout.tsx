import { useMutation, gql } from '@apollo/client';
import apolloClient from '../apollo/client';

// Define the logout mutation
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;

// Define the logout all devices mutation (optional)
const LOGOUT_ALL_MUTATION = gql`
  mutation LogoutAll($userId: String!) {
    logoutAll(userId: $userId) {
      message
    }
  }
`;

// Logout button component
export function Logout() {
  const [logout, { loading: logoutLoading, error: logoutError }] = useMutation(
    LOGOUT_MUTATION,
    {
      onCompleted: (data) => {
        console.log('Logout successful:', data.logout.message);

        // Clear Apollo Client cache
        apolloClient.clearStore();

        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
      },
      onError: (error) => {
        console.error('Logout error:', error);
      },
    }
  );

  const [logoutAll, { loading: logoutAllLoading }] = useMutation(
    LOGOUT_ALL_MUTATION,
    {
      onCompleted: (data) => {
        console.log('Logout all successful:', data.logoutAll.message);

        // Clear Apollo Client cache
        apolloClient.clearStore();

        // Redirect to login page
        window.location.href = '/login';
      },
      onError: (error) => {
        console.error('Logout all error:', error);
      },
    }
  );

  const handleLogout = () => {
    logout();
  };

  const handleLogoutAll = () => {
    // You would need to get the userId from your auth context or state
    const userId = 'your-user-id'; // Replace with actual user ID
    logoutAll({ variables: { userId } });
  };

  if (logoutError) {
    console.error('Logout error:', logoutError);
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleLogout}
        disabled={logoutLoading || logoutAllLoading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: logoutLoading || logoutAllLoading ? 'not-allowed' : 'pointer',
          opacity: logoutLoading || logoutAllLoading ? 0.6 : 1,
        }}
      >
        {logoutLoading ? 'Logging out...' : 'Log out'}
      </button>

      <button
        onClick={handleLogoutAll}
        disabled={logoutLoading || logoutAllLoading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: logoutLoading || logoutAllLoading ? 'not-allowed' : 'pointer',
          opacity: logoutLoading || logoutAllLoading ? 0.6 : 1,
        }}
      >
        {logoutAllLoading ? 'Logging out...' : 'Log out all devices'}
      </button>
    </div>
  );
}
