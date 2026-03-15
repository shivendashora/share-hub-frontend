export default function UserCard({ user, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 relative group ${isActive
          ? "bg-indigo-50"
          : "hover:bg-gray-50"
        }`}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-indigo-500 rounded-r-full" />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {user.image ? (
          <img
            src={user.image}
            alt={user.userName[0].toUpperCase()}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {user.userName[0].toUpperCase()}
          </div>
        )}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-sm font-semibold truncate ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
          {user.userName}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">Last Message</p>
      </div>

      {/* Time + unread */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[11px] text-gray-400">3:00am</span>
        {user.unread && (
          <span className="w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {user.unread}
          </span>
        )}
      </div>
    </button>
  );
}