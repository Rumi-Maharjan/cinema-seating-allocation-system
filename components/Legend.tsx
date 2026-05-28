export const Legend = () => (
    <div className="mt-10 flex gap-6 justify-center text-white flex-wrap px-4 text-sm">
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-600 rounded"></div>
            <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-600 rounded"></div>
            <span>VIP</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-500 rounded"></div>
            <span>Disability</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded"></div>
            <span>Broken</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-500 rounded"></div>
            <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-400 rounded"></div>
            <span>Options</span>
        </div>
    </div>
);