"use client";

import { MdMovieCreation } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import { SeatGrid } from "@/components/SeatGrid";
import { Legend } from "@/components/Legend";
import { isVIP } from "@/lib/vipSeats";
import { isMissingSeat } from "@/lib/seatData";
import { generateDisabilitySeats } from "@/lib/disabilitySeats";
import {
  getAllValidOptions,
  getAllPossibleSeats,
  getAvailableSeatsForNextPick,
  isCompleteGroup,
  getMatchingOption,
  canAddSeatToSelection,
  bookSeats,
  findAllSeatOptions
} from "@/lib/seatingAlgorithm";

export default function Home() {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];


  const [disabilitySeats, setDisabilitySeats] = useState<string[]>(() => generateDisabilitySeats());
  const [brokenSeats, setBrokenSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [adminOverride, setAdminOverride] = useState<boolean>(false);
  const [userType, setUserType] = useState<'regular' | 'vip' | 'disabled'>('regular');
  const [groupSize, setGroupSize] = useState<number>(2);
  
  const [allOptions, setAllOptions] = useState<{ seats: string[]; message: string }[]>([]);
  const [highlightedSeats, setHighlightedSeats] = useState<string[]>([]);
  const [availableSeatsForNext, setAvailableSeatsForNext] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const disabilitySeatsRef = useRef(disabilitySeats);
  
  useEffect(() => {
    disabilitySeatsRef.current = disabilitySeats;
  }, [disabilitySeats]);

  const isDisability = (row: string, col: number): boolean => {
    return disabilitySeats.includes(`${row}${col}`);
  };

  const isBroken = (row: string, col: number): boolean => {
    return brokenSeats.includes(`${row}${col}`);
  };

  const isBooked = (row: string, col: number): boolean => {
    return bookedSeats.includes(`${row}${col}`);
  };

  const getIsSelectable = (row: string, col: number): boolean => {
    const seatId = `${row}${col}`;
    
    if (isMissingSeat(row, col)) return false;
    if (isBroken(row, col)) return false;
    if (isBooked(row, col)) return false;
    
    if (adminOverride) {
      return highlightedSeats.includes(seatId);
    }
    
    if (!hasSearched) return false;
    
    if (userType === 'disabled') {
      return highlightedSeats.includes(seatId) && isDisability(row, col);
    }
    
    if (userType === 'vip') {
      return highlightedSeats.includes(seatId) && isVIP(row, col);
    }
    
    if (groupSize === 1) {
      return highlightedSeats.includes(seatId);
    }
    
    if (availableSeatsForNext.length > 0) {
      return availableSeatsForNext.includes(seatId);
    }
    
    return false;
  };

  // Generate broken seats with constraints
  const generateBrokenSeats = (currentDisabilitySeats: string[]): string[] => {
    const totalBroken = Math.floor(Math.random() * 5) + 6;
    const allBroken: string[] = [];
    const brokenPerRow: { [key: string]: number } = {};
    
    for (const row of rows) {
      brokenPerRow[row] = 0;
    }
    
    while (allBroken.length < totalBroken) {
      const randomRow = rows[Math.floor(Math.random() * rows.length)];
      const randomCol = Math.floor(Math.random() * 28) + 1;
      const seatId = `${randomRow}${randomCol}`;
      
      if (isMissingSeat(randomRow, randomCol)) continue;
      if (currentDisabilitySeats.includes(seatId)) continue;
      if (isVIP(randomRow, randomCol)) continue;
      if (brokenPerRow[randomRow] >= 2) continue;
      
      const isAdjacent = allBroken.some(broken => {
        const brokenRow = broken.charAt(0);
        const brokenCol = parseInt(broken.slice(1));
        return brokenRow === randomRow && Math.abs(brokenCol - randomCol) === 1;
      });
      
      if (!isAdjacent) {
        allBroken.push(seatId);
        brokenPerRow[randomRow]++;
      }
    }
    
    return allBroken;
  };

  // Generate new session (regenerates both broken AND disability seats)
  const regenerateSession = () => {
    const newDisabilitySeats = generateDisabilitySeats();
    setDisabilitySeats(newDisabilitySeats);
    
    const newBrokenSeats = generateBrokenSeats(newDisabilitySeats);
    setBrokenSeats(newBrokenSeats);
    
    setSelectedSeats([]);
    setBookedSeats([]);
    setAllOptions([]);
    setHighlightedSeats([]);
    setAvailableSeatsForNext([]);
    setHasSearched(false);
    setMessage("New session started - Disability and Broken seats regenerated");
    
    setSessionKey(prev => prev + 1);
  };

  const handleFindOptions = () => {
    if (adminOverride) {
      const allSeats: string[] = [];
      for (const row of rows) {
        for (let col = 1; col <= 28; col++) {
          const seatId = `${row}${col}`;
          if (!isMissingSeat(row, col) && !isBroken(row, col) && !isBooked(row, col)) {
            allSeats.push(seatId);
          }
        }
      }
      
      setHighlightedSeats(allSeats);
      setAvailableSeatsForNext(allSeats);
      setHasSearched(true);
      setAllOptions([]);
      setSelectedSeats([]);
      setMessage(`Admin Override: ${allSeats.length} seats available. Click seats to select up to ${groupSize} seats.`);
      return;
    }
    
    let userTypeMsg = userType === 'disabled' ? 'disabled' : (userType === 'vip' ? 'VIP' : 'regular');
    
    if (groupSize === 1) {
      const options = findAllSeatOptions(
        1,
        userType,
        brokenSeats,
        bookedSeats,
        disabilitySeats
      );
      
      setAllOptions(options);
      setSelectedSeats([]);
      setHasSearched(true);
      
      if (options.length === 0) {
        setHighlightedSeats([]);
        setAvailableSeatsForNext([]);
        setMessage(`No seats available.`);
      } else {
        const allPossibleSeats: string[] = [];
        for (const option of options) {
          allPossibleSeats.push(...option.seats);
        }
        const uniqueSeats = [...new Set(allPossibleSeats)];
        
        setHighlightedSeats(uniqueSeats);
        setAvailableSeatsForNext(uniqueSeats);
        setMessage(`Found ${uniqueSeats.length} available seat(s) for ${userTypeMsg} customer. Click on any highlighted seat to book.`);
      }
      return;
    }
    
    const options = getAllValidOptions(
      groupSize,
      userType,
      brokenSeats,
      bookedSeats,
      disabilitySeats
    );
    
    setAllOptions(options);
    setSelectedSeats([]);
    setHasSearched(true);
    
    if (options.length === 0) {
      setHighlightedSeats([]);
      setAvailableSeatsForNext([]);
      setMessage(`No seating options found for ${userTypeMsg} group of ${groupSize}`);
    } else {
      const allPossibleSeats = getAllPossibleSeats(
        groupSize,
        userType,
        brokenSeats,
        bookedSeats,
        disabilitySeats
      );
      setHighlightedSeats(allPossibleSeats);
      setAvailableSeatsForNext(allPossibleSeats);
      setMessage(`Found ${options.length} seating option(s) for ${userTypeMsg} group of ${groupSize}. Click on any highlighted seat to start.`);
    }
  };

  const handleSeatClick = (row: string, col: number) => {
    const seatId = `${row}${col}`;
    
    if (!getIsSelectable(row, col)) {
      setMessage("This seat is not available");
      return;
    }
    
    if (adminOverride) {
      if (selectedSeats.includes(seatId)) {
        setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      } else {
        if (selectedSeats.length >= groupSize) {
          setMessage(`You can only select up to ${groupSize} seats`);
          return;
        }
        setSelectedSeats([...selectedSeats, seatId]);
        const remaining = groupSize - (selectedSeats.length + 1);
        if (remaining === 0) {
          setMessage(`Group complete! Selected ${selectedSeats.length + 1} seats. Click 'Book' to confirm.`);
        } else {
          setMessage(`Selected ${selectedSeats.length + 1} of ${groupSize}. ${remaining} more seat(s) to select.`);
        }
      }
      return;
    }
    
    if (groupSize === 1) {
      setSelectedSeats([seatId]);
      setMessage(`Seat ${seatId} selected. Click 'Book' to confirm.`);
      return;
    }
    
    if (allOptions.length === 0) {
      setMessage("Please click 'Find Available Options' first");
      return;
    }
    
    if (!canAddSeatToSelection(allOptions, selectedSeats, seatId)) {
      setMessage("This seat would create an invalid seating arrangement");
      return;
    }
    
    const newSelection = [...selectedSeats, seatId];
    setSelectedSeats(newSelection);
    
    const nextAvailable = getAvailableSeatsForNextPick(allOptions, newSelection);
    setAvailableSeatsForNext(nextAvailable);
    setHighlightedSeats(nextAvailable);
    
    if (isCompleteGroup(allOptions, newSelection)) {
      const matchingOption = getMatchingOption(allOptions, newSelection);
      setMessage(`Group complete! ${matchingOption?.message}. Click 'Book' to confirm.`);
      setHighlightedSeats([]);
    } else {
      const remaining = groupSize - newSelection.length;
      setMessage(`Selected ${newSelection.length} of ${groupSize}. ${remaining} more seat(s) to select.`);
    }
  };

  const handleBook = () => {
    if (selectedSeats.length === 0) {
      setMessage("Please select seats first");
      return;
    }
    
    if (selectedSeats.length !== groupSize) {
      setMessage(`Please select exactly ${groupSize} seats (currently selected: ${selectedSeats.length})`);
      return;
    }
    
    const { newBookedSeats, message: msg } = bookSeats(selectedSeats, bookedSeats);
    setBookedSeats(newBookedSeats);
    setMessage(msg);
    
    setSelectedSeats([]);
    setAllOptions([]);
    setHighlightedSeats([]);
    setAvailableSeatsForNext([]);
    setHasSearched(false);
  };

  const handleClear = () => {
    setSelectedSeats([]);
    setAllOptions([]);
    setHighlightedSeats([]);
    setAvailableSeatsForNext([]);
    setHasSearched(false);
    setMessage("");
  };

  // Initialize broken seats on first load
  useEffect(() => {
    const newBrokenSeats = generateBrokenSeats(disabilitySeats);
    setBrokenSeats(newBrokenSeats);
  }, []);

  // Handle group size input change (remove leading zeros)
  const handleGroupSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove leading zeros
    value = value.replace(/^0+/, '');
    if (value === '') {
      value = '1';
    }
    const newSize = parseInt(value, 10);
    if (!isNaN(newSize) && newSize >= 1) {
      setGroupSize(newSize);
    } else {
      setGroupSize(1);
    }
    handleClear();
  };

  return (
    <main className="min-h-screen bg-gray-900 p-6 overflow-x-auto">
      <div className="max-w-full mx-auto">

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Customer Type:</label>
              <select
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value as 'regular' | 'vip' | 'disabled');
                  handleClear();
                }}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg"
              >
                <option value="regular">Regular Seats</option>
                <option value="vip">VIP Seats</option>
                <option value="disabled">Accessible Seats</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-white font-medium">Group Size:</label>
              <input
                type="number"
                min="1"
                value={groupSize}
                onChange={handleGroupSizeChange}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg w-20 text-center"
              />
            </div>
            
            <button
              onClick={handleFindOptions}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Find Available Options
            </button>
            
            <button
              onClick={handleBook}
              disabled={selectedSeats.length !== groupSize}
              className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                selectedSeats.length === groupSize && selectedSeats.length > 0
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Book Selected {groupSize === 1 ? 'Seat' : 'Group'}
            </button>
            
            <button
              onClick={handleClear}
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={regenerateSession}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              New Session
            </button>
            
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={adminOverride}
                onChange={(e) => {
                  setAdminOverride(e.target.checked);
                  handleClear();
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Admin Override</span>
            </label>
          </div>
        </div>

        <div className="min-h-15">
          {message && (
            <div className="text-center mb-4">
              <p className="font-medium text-blue-400">
                {message}
              </p>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="flex justify-center mb-2 min-w-max">
            <div className="flex gap-1 items-center">
              <div className="w-8"></div>
              {[1,2,3,4].map(c => <div key={`h${c}`} className="w-10 text-center text-gray-400 text-xs">{c}</div>)}
              <div className="w-10"></div>
              {Array.from({length:20},(_,i)=>i+5).map(c => <div key={`h${c}`} className="w-10 text-center text-gray-400 text-xs">{c}</div>)}
              <div className="w-10"></div>
              {[25,26,27,28].map(c => <div key={`h${c}`} className="w-10 text-center text-gray-400 text-xs">{c}</div>)}
              <div className="w-8"></div>
            </div>
          </div>

          <SeatGrid
            rows={rows}
            isBroken={isBroken}
            isDisability={isDisability}
            isVIP={isVIP}
            bookedSeats={bookedSeats}
            selectedSeats={selectedSeats}
            highlightedSeats={highlightedSeats}
            hasSearched={hasSearched}
            onSeatClick={handleSeatClick}
            sessionKey={sessionKey}
            isSelectable={getIsSelectable}
          />
        </div>

        <div className="text-center mt-8">
          <div className="bg-gray-700 text-white py-3 rounded-lg w-2/3 mx-auto font-bold text-xl flex items-center justify-center gap-2">
            <MdMovieCreation /> SCREEN <MdMovieCreation />
          </div>
        </div>

        <Legend />
        
      </div>
    </main>
  );
}