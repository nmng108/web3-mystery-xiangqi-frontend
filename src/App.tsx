import './App.css';
import { RouterProvider } from 'react-router-dom';
import AuthNavigator from './navigations/AuthNavigator.tsx';
import MainNavigator from './navigations/MainNavigator.tsx';
import { useAuthContext } from './hooks';

function App() {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <RouterProvider router={isAuthenticated ? MainNavigator : AuthNavigator} />
    </div>
  );
}

export default App;
