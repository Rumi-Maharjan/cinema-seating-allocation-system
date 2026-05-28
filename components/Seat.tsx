interface SeatProps {
  row: string;
  col: number;
  type: string;
  status: string;
  isMissing?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  hasSearched?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
}

export const Seat = ({ 
  row, 
  col, 
  type, 
  status, 
  isMissing = false, 
  isSelected = false, 
  isHighlighted = false,
  hasSearched = false,
  isSelectable = true,
  onClick 
}: SeatProps) => {
  const getColor = () => {
    if (isMissing) return 'bg-transparent';
    if (status === 'booked') return 'bg-gray-500';
    if (isSelected) return 'bg-green-500 ring-2 ring-green-300';
    
    // After search: highlight available seats
    if (hasSearched && isHighlighted && isSelectable) {
      return 'bg-yellow-400 ring-2 ring-yellow-300';
    }
    
    // After search: dim unavailable seats
    if (hasSearched && !isHighlighted && !isSelected && status !== 'booked') {
      if (type === 'disability') return 'bg-blue-500 opacity-40';
      if (type === 'vip') return 'bg-purple-600 opacity-40';
      return 'bg-green-600 opacity-40';
    }
    
    // Normal colors (before search)
    if (status === 'broken') return 'bg-red-500';
    if (type === 'disability') return 'bg-blue-500';
    if (type === 'vip') return 'bg-purple-600';
    return 'bg-green-600';
  };

  const canClick = () => {
    if (isMissing) return false;
    if (status === 'broken') return false;
    if (status === 'booked') return false;
    if (!isSelectable) return false;
    return true;
  };

  return (
    <div
      onClick={canClick() ? onClick : undefined}
      className={`
        w-10 h-10 rounded-md flex items-center justify-center 
        text-white text-xs font-medium flex-shrink-0
        ${getColor()}
        ${canClick() ? 'cursor-pointer hover:scale-105 transition-all' : 'cursor-not-allowed'}
      `}
    >
      {!isMissing && col}
    </div>
  );
};