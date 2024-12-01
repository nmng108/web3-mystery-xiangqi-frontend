import React, { useState } from 'react';
import { useAuthContext, useGlobalContext, useWalletProviderContext } from '../hooks';
import { Link, NavLink } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.svg';
import { Button } from '@mui/material';
import TruncatedText from './TruncatedText.tsx';

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedAccount, disconnectWallet } = useWalletProviderContext();
  const { user } = useAuthContext();

  const handleClickLogout = () => {
    disconnectWallet();
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
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
            <span className="font-semibold">{user?.playerName} (<TruncatedText text={selectedAccount} maxLength={12} />)</span>
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
                    <Link to={route} key={name}
                          className="block px-4 py-2 hover:bg-blue-gray-900 transition duration-200 text-white no-underline">
                      {name}
                    </Link>
                  );
                })}
                {/*</nav>*/}
                <button
                  onClick={handleClickLogout}
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
