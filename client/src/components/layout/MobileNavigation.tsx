import { useLocation } from "wouter";

const MobileNavigation = () => {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden z-50">
      <div className="grid grid-cols-5 gap-1">
        <a 
          href="/" 
          className="flex flex-col items-center justify-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${location === "/" ? "text-black" : "text-gray-500"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className={`text-xs mt-1 ${location === "/" ? "font-medium" : "text-gray-500"}`}>Home</span>
        </a>
        
        <a 
          href="/discover" 
          className="flex flex-col items-center justify-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${location === "/discover" ? "text-black" : "text-gray-500"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
          </svg>
          <span className={`text-xs mt-1 ${location === "/discover" ? "font-medium" : "text-gray-500"}`}>Discover</span>
        </a>
        
        <a 
          href="/calendar" 
          className="flex flex-col items-center justify-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${location === "/calendar" ? "text-black" : "text-gray-500"}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className={`text-xs mt-1 ${location === "/calendar" ? "font-medium" : "text-gray-500"}`}>Calendar</span>
        </a>
        
        <a 
          href="/favorites" 
          className="flex flex-col items-center justify-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${location === "/favorites" ? "text-black" : "text-gray-500"}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span className={`text-xs mt-1 ${location === "/favorites" ? "font-medium" : "text-gray-500"}`}>Favourites</span>
        </a>
        
        <a 
          href="/profile" 
          className="flex flex-col items-center justify-center p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${location === "/profile" ? "text-black" : "text-gray-500"}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span className={`text-xs mt-1 ${location === "/profile" ? "font-medium" : "text-gray-500"}`}>Profile</span>
        </a>
      </div>
    </div>
  );
};

export default MobileNavigation;
