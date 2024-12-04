import './App.css';
import { RouterProvider } from 'react-router-dom';
import { useGlobalContext } from './hooks';

function App() {
  const { router } = useGlobalContext();

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
