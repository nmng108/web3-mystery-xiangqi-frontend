import './App.css';
import { RouterProvider } from 'react-router-dom';
import AuthNavigator from './navigations/AuthNavigator.tsx';
import MainNavigator from './navigations/MainNavigator.tsx';
import { useAuthContext, useGlobalContext } from './hooks';

function App() {
  // const { user } = useAuthContext();
  const { router } = useGlobalContext();

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
