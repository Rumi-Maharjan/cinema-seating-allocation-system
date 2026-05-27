"use client";

import { MdMovieCreation } from "react-icons/md";
import { useState } from "react";

export default function Home() {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];

  // Get valid edge seats for disability (must start from the very edge)
  const getValidDisabilitySeatsForRow = (row: string): number[] => {
    const validSeats: number[] = [];
    
    if (row === 'O') {
      validSeats.push(1, 2, 3, 4);
      
      const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
      const removeCount = 10;
      const seatsToKeep = allMiddleCols.length - removeCount;
      const removeFromStart = Math.floor(removeCount / 2);
      const middleBlock = allMiddleCols.slice(removeFromStart, removeFromStart + seatsToKeep);
      
      if (middleBlock.length >= 3) {
        for (let i = 0; i < Math.min(3, middleBlock.length); i++) {
          validSeats.push(middleBlock[i]);
        }
        for (let i = Math.max(0, middleBlock.length - 3); i < middleBlock.length; i++) {
          validSeats.push(middleBlock[i]);
        }
      }
      
      validSeats.push(25, 26, 27, 28);
      
    } else if (row === 'N') {
      validSeats.push(1, 2, 3, 4);
      
      const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
      const removeCount = 9;
      const seatsToKeep = allMiddleCols.length - removeCount;
      const removeFromStart = Math.floor(removeCount / 2);
      const middleBlock = allMiddleCols.slice(removeFromStart, removeFromStart + seatsToKeep);
      
      if (middleBlock.length >= 3) {
        for (let i = 0; i < Math.min(3, middleBlock.length); i++) {
          validSeats.push(middleBlock[i]);
        }
        for (let i = Math.max(0, middleBlock.length - 3); i < middleBlock.length; i++) {
          validSeats.push(middleBlock[i]);
        }
      }
      
      validSeats.push(25, 26, 27, 28);
    }
    
    return [...new Set(validSeats)].sort((a, b) => a - b);
  };

  // Generate 6 random disability seats (can be 2+2+2 OR 3+3)
  const generateDisabilitySeats = (): string[] => {
    const firstTwoRows = ['O', 'N'];
    const allValidSeats: { row: string; col: number }[] = [];
    
    for (const row of firstTwoRows) {
      const validCols = getValidDisabilitySeatsForRow(row);
      for (const col of validCols) {
        allValidSeats.push({ row, col });
      }
    }
    
    const selected: string[] = [];
    const shuffled = [...allValidSeats];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const findAdjacentGroup = (size: number): { row: string; cols: number[] } | null => {
      for (let i = 0; i <= shuffled.length - size; i++) {
        const candidate = shuffled.slice(i, i + size);
        const sameRow = candidate.every(s => s.row === candidate[0].row);
        if (sameRow) {
          const cols = candidate.map(s => s.col).sort((a, b) => a - b);
          let isAdjacent = true;
          for (let j = 0; j < cols.length - 1; j++) {
            if (cols[j + 1] !== cols[j] + 1) {
              isAdjacent = false;
              break;
            }
          }
          if (isAdjacent) {
            return { row: candidate[0].row, cols };
          }
        }
      }
      return null;
    };
    
    const group1 = findAdjacentGroup(3);
    if (group1) {
      for (const col of group1.cols) {
        selected.push(`${group1.row}${col}`);
      }
      for (let i = 0; i < shuffled.length; i++) {
        if (shuffled[i].row === group1.row && group1.cols.includes(shuffled[i].col)) {
          shuffled.splice(i, 1);
          i--;
        }
      }
      
      const group2 = findAdjacentGroup(3);
      if (group2) {
        for (const col of group2.cols) {
          selected.push(`${group2.row}${col}`);
        }
      }
    }
    
    if (selected.length < 6) {
      selected.length = 0;
      const shuffledAgain = [...allValidSeats];
      for (let i = shuffledAgain.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledAgain[i], shuffledAgain[j]] = [shuffledAgain[j], shuffledAgain[i]];
      }
      
      let pairsFound = 0;
      for (let i = 0; i < shuffledAgain.length - 1 && pairsFound < 3; i++) {
        const seat1 = shuffledAgain[i];
        const seat2 = shuffledAgain[i + 1];
        if (seat1.row === seat2.row && Math.abs(seat1.col - seat2.col) === 1) {
          const key1 = `${seat1.row}${seat1.col}`;
          const key2 = `${seat2.row}${seat2.col}`;
          if (!selected.includes(key1) && !selected.includes(key2)) {
            selected.push(key1, key2);
            pairsFound++;
            i++;
          }
        }
      }
    }
    
    if (selected.length < 6) {
      for (const seat of allValidSeats) {
        const key = `${seat.row}${seat.col}`;
        if (!selected.includes(key)) {
          selected.push(key);
          if (selected.length === 6) break;
        }
      }
    }
    
    return selected.slice(0, 6);
  };

  // Generate broken seats (6-10 random, max 2 per row, not adjacent, never VIP or disability)
  const generateBrokenSeats = (
    disabilitySeatsList: string[],
    vipChecker: (row: string, col: number) => boolean
  ): string[] => {
    const brokenSeatsList: string[] = [];
    const totalBroken = Math.floor(Math.random() * 5) + 6; // 6 to 10
    
    // Collect all available seats (not disability, not VIP, not already broken)
    const allRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    const availableSeats: { row: string; col: number }[] = [];
    
    for (const row of allRows) {
      // Get all columns that exist in this row
      let existingCols: number[] = [];
      if (row === 'A') {
        existingCols = [1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 27, 28];
      } else if (['B', 'C', 'D', 'E'].includes(row)) {
        existingCols = Array.from({ length: 28 }, (_, i) => i + 1);
      } else {
        // For rows F-O, need to get actual existing columns
        const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
        const removeCountMap: { [key: string]: number } = {
          'F': 1, 'G': 2, 'H': 3, 'I': 4, 'J': 5, 'K': 6, 'L': 7, 'M': 8, 'N': 9, 'O': 10,
        };
        const removeCount = removeCountMap[row] || 0;
        const seatsToKeep = allMiddleCols.length - removeCount;
        const removeFromStart = Math.floor(removeCount / 2);
        const middleBlock = allMiddleCols.slice(removeFromStart, removeFromStart + seatsToKeep);
        existingCols = [...[1, 2, 3, 4], ...middleBlock, ...(row === 'O' ? [27, 28] : [25, 26, 27, 28])];
      }
      
      for (const col of existingCols) {
        const seatId = `${row}${col}`;
        if (!disabilitySeatsList.includes(seatId) && !vipChecker(row, col)) {
          availableSeats.push({ row, col });
        }
      }
    }
    
    // Shuffle available seats
    for (let i = availableSeats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSeats[i], availableSeats[j]] = [availableSeats[j], availableSeats[i]];
    }
    
    // Track broken seats per row
    const brokenPerRow: { [key: string]: number } = {};
    for (const row of allRows) {
      brokenPerRow[row] = 0;
    }
    
    // Select broken seats with constraints
    for (const seat of availableSeats) {
      if (brokenSeatsList.length >= totalBroken) break;
      if (brokenPerRow[seat.row] >= 2) continue;
      
      // Check adjacency with existing broken seats
      const adjacentSeats = [
        `${seat.row}${seat.col - 1}`,
        `${seat.row}${seat.col + 1}`,
      ];
      const isAdjacentToBroken = adjacentSeats.some(adj => brokenSeatsList.includes(adj));
      
      if (!isAdjacentToBroken) {
        brokenSeatsList.push(`${seat.row}${seat.col}`);
        brokenPerRow[seat.row]++;
      }
    }
    
    return brokenSeatsList;
  };

  const [disabilitySeats] = useState<string[]>(() => generateDisabilitySeats());
  const [brokenSeats, setBrokenSeats] = useState<string[]>(() => []);
  const [sessionKey, setSessionKey] = useState(0);
  

  // Get VIP seats for each row
  const getVIPSeats = (row: string): number[] => {
    const vipCountMap: { [key: string]: number } = {
      'E': 12,
      'F': 13,
      'G': 14,
      'H': 15,
    };
    
    const vipCount = vipCountMap[row] || 0;
    if (vipCount === 0) return [];
    
    const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
    const totalMiddle = allMiddleCols.length;
    const startIndex = Math.floor((totalMiddle - vipCount) / 2);
    
    return allMiddleCols.slice(startIndex, startIndex + vipCount);
  };

  // Check if a seat is VIP
  const isVIP = (row: string, col: number): boolean => {
    const vipSeats = getVIPSeats(row);
    return vipSeats.includes(col);
  };

  // Initialize broken seats on first load
  useState(() => {
    const vipChecker = (row: string, col: number) => isVIP(row, col);
    const newBrokenSeats = generateBrokenSeats(disabilitySeats, vipChecker);
    setBrokenSeats(newBrokenSeats);
  });

  // Check if a seat is Disability
  const isDisability = (row: string, col: number): boolean => {
    return disabilitySeats.includes(`${row}${col}`);
  };

  // Check if a seat is Broken
  const isBroken = (row: string, col: number): boolean => {
    return brokenSeats.includes(`${row}${col}`);
  };

  // Get seat color
  const getSeatColor = (row: string, col: number, isMissing: boolean = false): string => {
    if (isMissing) return 'bg-transparent';
    if (isBroken(row, col)) return 'bg-red-500';
    if (isDisability(row, col)) return 'bg-blue-500';
    if (isVIP(row, col)) return 'bg-purple-600';
    return 'bg-green-600';
  };

  // Get centered middle block for each row
  const getCenteredMiddleBlock = (row: string): number[] => {
    const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5)
    
    const removeCountMap: { [key: string]: number } = {
      'F': 1,
      'G': 2,
      'H': 3,
      'I': 4,
      'J': 5,
      'K': 6,
      'L': 7,
      'M': 8,
      'N': 9,
      'O': 10,
    }
    
    const removeCount = removeCountMap[row] || 0
    
    if (removeCount === 0) return allMiddleCols
    
    const seatsToKeep = allMiddleCols.length - removeCount
    const removeFromStart = Math.floor(removeCount / 2)
    
    return allMiddleCols.slice(removeFromStart, removeFromStart + seatsToKeep)
  }

  // Get columns for each row
  const getColumnsForRow = (row: string) => {
    if (row === 'A') {
      const left = [1, 2]
      const middle = Array.from({ length: 20 }, (_, i) => i + 5)
      const right = [27, 28]
      return { left, middle, right, leftMissing: [3, 4], rightMissing: [25, 26] }
    }
    
    if (['B', 'C', 'D'].includes(row)) {
      const left = [1, 2, 3, 4]
      const middle = Array.from({ length: 20 }, (_, i) => i + 5)
      const right = [25, 26, 27, 28]
      return { left, middle, right }
    }
    
    if (row === 'E') {
      const left = [1, 2, 3, 4]
      const middle = Array.from({ length: 20 }, (_, i) => i + 5)
      const right = [25, 26, 27, 28]
      return { left, middle, right }
    }
    
    if (['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].includes(row)) {
      const left = [1, 2, 3, 4]
      const middle = getCenteredMiddleBlock(row)
      const right = [25, 26, 27, 28]
      const allMiddle = Array.from({ length: 20 }, (_, i) => i + 5)
      const missingMiddle = allMiddle.filter(col => !middle.includes(col))
      return { left, middle, right, missingMiddle, needsCentering: true }
    }
    
    return { left: [], middle: [], right: [] }
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="max-w-full py-4">

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
          
          {/* Column numbers header */}
          <div className="flex justify-center mb-2 min-w-max">
            <div className="flex gap-1 items-center">
              <div className="w-8 flex-shrink-0"></div>
              {[1, 2, 3, 4].map((col) => (
                <div key={`header-${col}`} className="w-10 text-center text-gray-500 text-xs flex-shrink-0">
                  {col}
                </div>
              ))}
              <div className="w-10 flex-shrink-0"></div>
              {Array.from({ length: 20 }, (_, i) => i + 5).map((col) => (
                <div key={`header-${col}`} className="w-10 text-center text-gray-500 text-xs flex-shrink-0">
                  {col}
                </div>
              ))}
              <div className="w-10 flex-shrink-0"></div>
              {[25, 26, 27, 28].map((col) => (
                <div key={`header-${col}`} className="w-10 text-center text-gray-500 text-xs flex-shrink-0">
                  {col}
                </div>
              ))}
              <div className="w-8 flex-shrink-0"></div>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col gap-1 min-w-max">
            {rows.map((row) => {
              const { left, middle, right, leftMissing = [], rightMissing = [], missingMiddle = [], needsCentering = false } = getColumnsForRow(row)
              const isRowA = row === 'A'
              
              return (
                <div key={`${row}-${sessionKey}`} className="flex gap-1 items-center justify-center">
                  
                  <div className="w-8 text-white font-bold text-center text-lg flex-shrink-0 bg-gray-900 sticky left-0 z-10">
                    {row}
                  </div>
                  
                  <div className={`flex gap-1 min-w-329.5 ${needsCentering ? 'justify-center' : ''}`}>
                    
                    {needsCentering ? (
                      <div className="flex gap-1 justify-center">
                        {left.map((col) => (
                          <div
                            key={`${row}${col}`}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                          >
                            {col}
                          </div>
                        ))}
                        <div className="w-10 flex-shrink-0"></div>
                        <div className="flex gap-1">
                          {middle.map((col) => (
                            <div
                              key={`${row}${col}`}
                              className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                            >
                              {col}
                            </div>
                          ))}
                        </div>
                        <div className="w-10 flex-shrink-0"></div>
                        {right.map((col) => (
                          <div
                            key={`${row}${col}`}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                          >
                            {col}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        {left.map((col) => (
                          <div
                            key={`${row}${col}`}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                          >
                            {col}
                          </div>
                        ))}
                        {isRowA && leftMissing.map((col) => (
                          <div key={`missing-left-${col}`} className="w-10 flex-shrink-0"></div>
                        ))}
                        <div className="w-10 flex-shrink-0"></div>
                        {middle.map((col) => (
                          <div
                            key={`${row}${col}`}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                          >
                            {col}
                          </div>
                        ))}
                        {missingMiddle && missingMiddle.map((col) => (
                          <div key={`missing-middle-${col}`} className="w-10 flex-shrink-0"></div>
                        ))}
                        <div className="w-10 flex-shrink-0"></div>
                        {isRowA && rightMissing.map((col) => (
                          <div key={`missing-right-${col}`} className="w-10 flex-shrink-0"></div>
                        ))}
                        {right.map((col) => (
                          <div
                            key={`${row}${col}`}
                            className={`w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${getSeatColor(row, col)}`}
                          >
                            {col}
                          </div>
                        ))}
                      </div>
                    )}
                    
                  </div>
                  
                  <div className="w-8 text-white font-bold text-center text-lg flex-shrink-0 bg-gray-900 sticky right-0 z-10">
                    {row}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Screen at the BOTTOM */}
        <div className="text-center mt-8 px-4">
          <div className="bg-gray-700 text-white py-3 rounded-lg w-2/3 mx-auto font-bold text-xl flex items-center justify-center gap-2">
            <MdMovieCreation />SCREEN<MdMovieCreation />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-10 flex gap-8 justify-center text-white flex-wrap px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded"></div>
            <span>Regular Seat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded"></div>
            <span>VIP Seat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <span>Disability Seat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span>Broken Seat</span>
          </div>
        </div>
      </div>
    </main>
  );
}