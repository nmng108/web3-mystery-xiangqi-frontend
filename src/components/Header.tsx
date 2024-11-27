import React, { useState } from 'react';
import { useAuthContext } from '../hooks';
import { Link, NavLink } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.svg';
import { Button } from '@mui/material';
// import { getAccountString } from '../utils/helpers';
// import { useMoralis } from 'react-moralis';
// import { useMoralisDapp } from '../contexts/MoralisDappProvider';

// const Header = () => {
//   const { setIsAuthenticated } = useAuthContext();
//
//   const handlePressOnLogout = () => {
//     setIsAuthenticated(false);
//   };
//
//   // const { walletAddress } = useMoralisDapp();
//   // const { authenticate, isAuthenticated, isAuthenticating } = useMoralis();
//
//   // const handleConnect = async () => {
//   //   await authenticate();
//   // };
//   return (
//     <nav className="fixed top-0 left-0 select-none bg-nav w-full min-h-20 h-20 z-10">
//       <div className="flex flex-no-shrink justify-between h-full items-center ">
//         <div className=" m-1.5 flex items-center">
//           {/*<img alt="web3-chess-logo" className="h-14 w-14 mx-2" src={Logo} />*/}
//           <h2 className="text-navFont text-2xl mx-2 font-montserrat font-bold">
//             Mystery Xiangqi
//           </h2>
//         </div>
//         <div className="flex justify-around">
//           {[
//             { name: 'Home', route: '/' },
//             { name: 'Dashboard', route: '/dashboard' },
//             { name: 'MarketPlace', route: '/market' },
//           ].map(({ name, route }) => {
//             return (
//               <Link
//                 to={route}
//                 // key={name}
//                 className="text-navFont font-montserrat text-md font-bold mx-3 tracking-wide"
//               >
//                 {name}
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </nav>
//   );
// };

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { setIsAuthenticated } = useAuthContext();

  const handlePressOnLogout = () => {
    setIsAuthenticated(false);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    // <header className="fixed top-0 left-0 select-none bg-nav w-full min-h-20 h-20 z-10 bg-gray-800 text-white shadow-md">
    //   <div className="container flex items-center justify-between py-4 px-6">
    //
    //     {/* Logo */}
    //     <div className="text-lg font-bold">
    //       <a href="/" className="text-white hover:text-gray-300">
    //         {/*<img src="/path/to/logo.svg" alt="Logo" className="h-8" />*/}
    //         Xiangqi
    //       </a>
    //     </div>
    //
    //     {/* Navigation Buttons */}
    //     <nav className="hidden md:flex space-x-6">
    //       {[
    //         { name: 'Home', route: '/' },
    //         { name: 'Dashboard', route: '/dashboard' },
    //         { name: 'MarketPlace', route: '/market' },
    //       ].map(({ name, route }) => {
    //         return (
    //           <Link
    //             to={route}
    //             // key={name}
    //             className="text-navFont font-montserrat text-md font-bold mx-3 tracking-wide"
    //           >
    //             {name}
    //           </Link>
    //         );
    //       })}
    //     </nav>
    //
    //     {/* Username and Dropdown */}
    //     <div className="relative">
    //       <button
    //         onClick={toggleDropdown}
    //         className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
    //       >
    //         <span className="font-semibold">Username</span>
    //         <svg
    //           className="w-4 h-4"
    //           fill="currentColor"
    //           viewBox="0 0 20 20"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </button>
    //
    //       {/* Dropdown Menu */}
    //       {dropdownOpen && (
    //         <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-700 z-20">
    //           <a
    //             href="/profile"
    //             className="block px-4 py-2 hover:bg-gray-100 transition duration-200"
    //           >
    //             Profile
    //           </a>
    //           <button
    //             onClick={handlePressOnLogout} // Replace with your logout function
    //             className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-200"
    //           >
    //             Logout
    //           </button>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </header>
    <header className="fixed top-0 left-0 select-none bg-nav w-full min-h-16 z-10 bg-gray-800 text-white shadow-md">
      <div className="w-full h-16 container mx-auto flex justify-between items-stretch">
        {/* Logo */}
        <div className="flex items-center space-x-2 text-white text-lg font-bold">
          <div className="w-10 h-10 rounded-full bg-blue-400"></div>
          <span>Mystery Xiangqi</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex md:space-x-6 md:items-center text-blue-400">
          {/*<nav className="hidden md:flex space-x-6">*/}
          {[
            { name: 'Home', route: '/' },
            { name: 'Leaderboard', route: '/leaderboard' },
            { name: 'MarketPlace', route: '/marketplace' },
          ].map(({ name, route }) => {
            return (
              <NavLink to={route} key={name}
                       className={({ isActive, isPending, isTransitioning }) => [
                         isActive ? 'text-blue-gray-200' : 'text-blue-400',
                         'no-underline text-navFont font-montserrat text-md font-bold mx-3 tracking-wide',
                       ].join(' ')}>
                {name}
              </NavLink>
            );
          })}
          {/*</nav>*/}
        </nav>

        {/* User Profile */}
        <div className="h-full relative">
          <Button
            variant="text"
            onClick={toggleDropdown}
            className="flex h-full items-center space-x-2 text-white border-0 hover:text-gray-300 focus:outline-none"
          >
            <img src={defaultAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            <span className="font-semibold">0x1939fji0koq08...</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-40 bg-gray-700 rounded-lg py-2 mt-2 shadow-lg text-gray-700 z-20">
              <nav/* className="hidden md:flex space-x-6 text-teal-300"*/>
                {/*<nav className="hidden md:flex space-x-6">*/}
                {[
                  { name: 'Profile', route: '/profile' },
                  { name: 'History', route: '/history' },
                ].map(({ name, route }) => {
                  return (
                    <Link to={route} key={name} className="block px-4 py-2 hover:bg-blue-gray-900 transition duration-200 text-white no-underline">
                      {name}
                    </Link>
                  );
                })}
                {/*</nav>*/}
              <button
                onClick={handlePressOnLogout}
                className="block w-full px-4 py-2 border-0 hover:bg-gray-900 bg-blue-gray-700 transition duration-200 font-bold text-white text-md"
              >
                Logout
              </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>

  );
};

const Loader = () => {
  return (
    <div className="flex items-center justify-center ">
      <div className="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
    </div>
  );
};

export default Header;
