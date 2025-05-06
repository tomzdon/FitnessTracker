import { User } from "@shared/schema";
import { UserCircle, Edit } from "lucide-react";

interface ProfileHeaderProps {
  user?: User;
  onEditProfile?: () => void;
}

const ProfileHeader = ({ user, onEditProfile }: ProfileHeaderProps) => {
  const username = user?.username || 'User';
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : username;
    
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm mb-6 text-center">
      <div className="mb-4 flex justify-center">
        {/* User avatar placeholder */}
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          <UserCircle className="w-16 h-16 text-gray-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold">{displayName}</h2>
      <p className="text-gray-500 mb-4">@{username.toLowerCase()}</p>
      
      <button 
        onClick={onEditProfile}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit Profile
      </button>
    </div>
  );
};

export default ProfileHeader;