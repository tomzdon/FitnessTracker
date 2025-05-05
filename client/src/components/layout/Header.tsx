import { Link, useLocation } from "wouter";
import { Bell } from "lucide-react";

const Header = () => {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <svg width="48" height="22" viewBox="0 0 48 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
            <path d="M12 0C5.373 0 0 4.925 0 11s5.373 11 12 11 12-4.925 12-11S18.627 0 12 0zm0 19c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm24-8c0 4.411-3.589 8-8 8s-8-3.589-8-8 3.589-8 8-8 8 3.589 8 8zm-12 0c0-2.206 1.794-4 4-4s4 1.794 4 4-1.794 4-4 4-4-1.794-4-4z" fill="currentColor" />
          </svg>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <a className={`flex items-center ${location === "/" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="font-medium">Home</span>
            </a>
          </Link>
          <Link href="/discover">
            <a className={`flex items-center ${location === "/discover" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
              <span>Discover</span>
            </a>
          </Link>
          <Link href="/calendar">
            <a className={`flex items-center ${location === "/calendar" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Calendar</span>
            </a>
          </Link>
          <Link href="/favorites">
            <a className={`flex items-center ${location === "/favorites" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Favourites</span>
            </a>
          </Link>
        </nav>

        {/* User Controls */}
        <div className="flex items-center space-x-5">
          <div className="relative">
            <button className="relative">
              <Bell className="h-6 w-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2.5 h-2.5"></span>
            </button>
          </div>
          <Link href="/profile">
            <a className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 pr-3">
              <div className="bg-gray-700 rounded-full h-8 w-8 overflow-hidden flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Tomasz</span>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
