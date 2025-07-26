import { useAuth } from '../../containers/AuthContext/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();

  return <div className="min-h-screen bg-gray-50">dashboard</div>;
};
