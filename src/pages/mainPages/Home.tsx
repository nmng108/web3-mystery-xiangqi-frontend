import useContextHook from "../../hooks/useContextHook";
import PageContainer from "../../components/PageContainer.tsx";

const Home: React.FC = () => {
  const {setIsAuthenticated} = useContextHook();

  const handlePressOnLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <PageContainer>
      <div className="flex bg-white flex-col justify-center items-center min-h-screen">
        <p className="text-xl text-green-500 font-bold">Home Page</p>
      </div>
    </PageContainer>
  );
};

export default Home;
