import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#003366] p-4 md:p-6 mt-10">
      <div className="container mx-auto text-center">
        <p className="text-white text-sm md:text-base">© 2023</p>
        {/* Example of adding more content */}
        <div className="mt-4">
          <a href="/terms" className="text-white hover:text-gray-300 text-sm md:text-base transition duration-300">
            Terms of Service
          </a>
          <span className="text-white mx-2">|</span>
          <a href="/privacy" className="text-white hover:text-gray-300 text-sm md:text-base transition duration-300">
            Privacy Policy
          </a>
        </div>
        <div className="mt-4">
          <span className="text-white text-sm md:text-base">
            Follow us on 
            <a href="http://twitter.com" className="text-blue-500 hover:text-blue-400 mx-2 transition duration-300">
              Twitter
            </a>
            <a href="http://facebook.com" className="text-blue-800 hover:text-blue-700 transition duration-300">
              Facebook
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;