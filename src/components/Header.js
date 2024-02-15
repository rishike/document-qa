import React, { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="bg-[#003366] p-3 md:p-5 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-center md:justify-between items-center">
            <h1 className="text-lg md:text-xl text-white font-semibold">Document Question Answering</h1>
            <nav className="hidden md:block">
              <ul className="flex justify-center space-x-4">
              </ul>
            </nav>
            <button 
              className="text-white font-semibold md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden text-center mt-4">
              <ul>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;