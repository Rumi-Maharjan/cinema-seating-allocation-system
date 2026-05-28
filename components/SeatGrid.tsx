import { Seat } from './Seat';
import { getColumnsForRow, isMissingSeat } from '@/lib/seatData';

interface SeatGridProps {
  rows: string[];
  isBroken: (row: string, col: number) => boolean;
  isDisability: (row: string, col: number) => boolean;
  isVIP: (row: string, col: number) => boolean;
  bookedSeats: string[];
  selectedSeats: string[];
  highlightedSeats?: string[];
  hasSearched?: boolean;
  onSeatClick: (row: string, col: number) => void;
  sessionKey: number;
  isSelectable?: (row: string, col: number) => boolean;
}

export const SeatGrid = ({
  rows,
  isBroken,
  isDisability,
  isVIP,
  bookedSeats,
  selectedSeats,
  highlightedSeats = [],
  hasSearched = false,
  onSeatClick,
  sessionKey,
  isSelectable,
}: SeatGridProps) => {
  return (
    <div className="flex flex-col gap-1 min-w-max">
      {rows.map((row) => {
        const config = getColumnsForRow(row);
        const isRowA = row === 'A';
        
        return (
          <div key={`${row}-${sessionKey}`} className="flex gap-1 items-center justify-center">
            {/* Left row letter */}
            <div className="w-8 text-white font-bold text-center text-lg flex-shrink-0 bg-gray-900 sticky left-0 z-10">
              {row}
            </div>
            
            <div className={`flex gap-1 min-w-329.5 ${config.needsCentering ? 'justify-center' : ''}`}>
              {config.needsCentering ? (
                // Centered layout for rows F-O
                <div className="flex gap-1 justify-center">
                  {config.left.map((col) => {
                    const seatId = `${row}${col}`;
                    const isMissing = isMissingSeat(row, col);
                    const isHighlighted = highlightedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBrokenSeat = isBroken(row, col);
                    const isBookedSeat = bookedSeats.includes(seatId);
                    
                    let status: 'available' | 'booked' | 'broken' = 'available';
                    if (isBrokenSeat) status = 'broken';
                    if (isBookedSeat) status = 'booked';
                    
                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                        status={status}
                        isMissing={isMissing}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasSearched={hasSearched}
                        isSelectable={isSelectable ? isSelectable(row, col) : true}
                        onClick={() => onSeatClick(row, col)}
                      />
                    );
                  })}
                  <div className="w-10 flex-shrink-0"></div>
                  <div className="flex gap-1">
                    {config.middle.map((col) => {
                      const seatId = `${row}${col}`;
                      const isMissing = isMissingSeat(row, col);
                      const isHighlighted = highlightedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      const isBrokenSeat = isBroken(row, col);
                      const isBookedSeat = bookedSeats.includes(seatId);
                      
                      let status: 'available' | 'booked' | 'broken' = 'available';
                      if (isBrokenSeat) status = 'broken';
                      if (isBookedSeat) status = 'booked';
                      
                      return (
                        <Seat
                          key={seatId}
                          row={row}
                          col={col}
                          type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                          status={status}
                          isMissing={isMissing}
                          isSelected={isSelected}
                          isHighlighted={isHighlighted}
                          hasSearched={hasSearched}
                          isSelectable={isSelectable ? isSelectable(row, col) : true}
                          onClick={() => onSeatClick(row, col)}
                        />
                      );
                    })}
                  </div>
                  <div className="w-10 flex-shrink-0"></div>
                  {config.right.map((col) => {
                    const seatId = `${row}${col}`;
                    const isMissing = isMissingSeat(row, col);
                    const isHighlighted = highlightedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBrokenSeat = isBroken(row, col);
                    const isBookedSeat = bookedSeats.includes(seatId);
                    
                    let status: 'available' | 'booked' | 'broken' = 'available';
                    if (isBrokenSeat) status = 'broken';
                    if (isBookedSeat) status = 'booked';
                    
                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                        status={status}
                        isMissing={isMissing}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasSearched={hasSearched}
                        isSelectable={isSelectable ? isSelectable(row, col) : true}
                        onClick={() => onSeatClick(row, col)}
                      />
                    );
                  })}
                </div>
              ) : (
                // Normal layout for rows A-E
                <div className="flex gap-1">
                  {config.left.map((col) => {
                    const seatId = `${row}${col}`;
                    const isMissing = isMissingSeat(row, col);
                    const isHighlighted = highlightedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBrokenSeat = isBroken(row, col);
                    const isBookedSeat = bookedSeats.includes(seatId);
                    
                    let status: 'available' | 'booked' | 'broken' = 'available';
                    if (isBrokenSeat) status = 'broken';
                    if (isBookedSeat) status = 'booked';
                    
                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                        status={status}
                        isMissing={isMissing}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasSearched={hasSearched}
                        isSelectable={isSelectable ? isSelectable(row, col) : true}
                        onClick={() => onSeatClick(row, col)}
                      />
                    );
                  })}
                  {isRowA && config.leftMissing?.map((col) => (
                    <div key={`missing-left-${col}`} className="w-10 flex-shrink-0"></div>
                  ))}
                  <div className="w-10 flex-shrink-0"></div>
                  {config.middle.map((col) => {
                    const seatId = `${row}${col}`;
                    const isMissing = isMissingSeat(row, col);
                    const isHighlighted = highlightedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBrokenSeat = isBroken(row, col);
                    const isBookedSeat = bookedSeats.includes(seatId);
                    
                    let status: 'available' | 'booked' | 'broken' = 'available';
                    if (isBrokenSeat) status = 'broken';
                    if (isBookedSeat) status = 'booked';
                    
                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                        status={status}
                        isMissing={isMissing}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasSearched={hasSearched}
                        isSelectable={isSelectable ? isSelectable(row, col) : true}
                        onClick={() => onSeatClick(row, col)}
                      />
                    );
                  })}
                  {config.missingMiddle?.map((col) => (
                    <div key={`missing-middle-${col}`} className="w-10 flex-shrink-0"></div>
                  ))}
                  <div className="w-10 flex-shrink-0"></div>
                  {isRowA && config.rightMissing?.map((col) => (
                    <div key={`missing-right-${col}`} className="w-10 flex-shrink-0"></div>
                  ))}
                  {config.right.map((col) => {
                    const seatId = `${row}${col}`;
                    const isMissing = isMissingSeat(row, col);
                    const isHighlighted = highlightedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const isBrokenSeat = isBroken(row, col);
                    const isBookedSeat = bookedSeats.includes(seatId);
                    
                    let status: 'available' | 'booked' | 'broken' = 'available';
                    if (isBrokenSeat) status = 'broken';
                    if (isBookedSeat) status = 'booked';
                    
                    return (
                      <Seat
                        key={seatId}
                        row={row}
                        col={col}
                        type={isDisability(row, col) ? 'disability' : isVIP(row, col) ? 'vip' : 'regular'}
                        status={status}
                        isMissing={isMissing}
                        isSelected={isSelected}
                        isHighlighted={isHighlighted}
                        hasSearched={hasSearched}
                        isSelectable={isSelectable ? isSelectable(row, col) : true}
                        onClick={() => onSeatClick(row, col)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Right row letter */}
            <div className="w-8 text-white font-bold text-center text-lg flex-shrink-0 bg-gray-900 sticky right-0 z-10">
              {row}
            </div>
          </div>
        );
      })}
    </div>
  );
};