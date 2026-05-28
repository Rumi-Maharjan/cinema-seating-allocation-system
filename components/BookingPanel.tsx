interface BookingPanelProps {
    groupSize: number;
    setGroupSize: (size: number) => void;
    userType: string;
    setUserType: (type: string) => void;
    adminOverride: boolean;
    setAdminOverride: (override: boolean) => void;
    onBook: () => void;
    onClearSelection: () => void;
    message: string;
}

export const BookingPanel = ({
    groupSize,
    setGroupSize,
    userType,
    setUserType,
    adminOverride,
    setAdminOverride,
    onBook,
    onClearSelection,
    message,
}: BookingPanelProps) => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
                <label className="text-white font-medium">Group Size (1-7):</label>
                <input
                type="number"
                min="1"
                max="7"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="regular">Regular Customer</option>
                <option value="vip">VIP Customer</option>
                <option value="disabled">Disabled Customer</option>
            </select>
            
            <button
                onClick={onBook}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Book Selected Seats
            </button>
            
            <button
                onClick={onClearSelection}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Clear Selection
            </button>
            
            <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                type="checkbox"
                checked={adminOverride}
                onChange={(e) => setAdminOverride(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
                />
                <span>Admin Override</span>
            </label>
        </div>
        
        {message && (
            <div className="mt-3 text-center">
                <p className={`font-medium ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
                </p>
            </div>
        )}
    </div>
);