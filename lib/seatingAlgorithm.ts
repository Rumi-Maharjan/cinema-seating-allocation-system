import { isMissingSeat } from './seatData';
import { isVIP } from './vipSeats';

// HELPER FUNCTIONS

const getMiddleBlockCols = (row: string): number[] => {
  if (row === 'A') return [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  if (['B', 'C', 'D', 'E'].includes(row)) return Array.from({ length: 20 }, (_, i) => i + 5);
  
  const removeMap: Record<string, number> = {
    'F': 1, 'G': 2, 'H': 3, 'I': 4, 'J': 5, 'K': 6, 'L': 7, 'M': 8, 'N': 9, 'O': 10
  };
  const removeCount = removeMap[row] || 0;
  const allMiddle = Array.from({ length: 20 }, (_, i) => i + 5);
  if (removeCount === 0) return allMiddle;
  
  const keepCount = allMiddle.length - removeCount;
  const removeFromStart = Math.floor(removeCount / 2); 
  return allMiddle.slice(removeFromStart, removeFromStart + keepCount);
};

const getAvailableSeatsInBlock = (
  row: string,
  block: 'left' | 'middle' | 'right',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[],
  userType: 'regular' | 'vip' | 'disabled'
): number[] => {
  let cols: number[] = [];
  
  if (block === 'left') cols = [1, 2, 3, 4];
  else if (block === 'middle') cols = getMiddleBlockCols(row);
  else if (block === 'right') cols = [25, 26, 27, 28];
  
  const available: number[] = [];
  
  for (const col of cols) {
    const seatId = `${row}${col}`;
    const isDisabilitySeat = disabilitySeats.includes(seatId);
    
    if (isMissingSeat(row, col)) continue;
    if (brokenSeats.includes(seatId)) continue;
    if (bookedSeats.includes(seatId)) continue;
    
    if (userType === 'disabled') {
      if (isDisabilitySeat) available.push(col);
      continue;
    }
    
    if (userType === 'vip') {
      if (isVIP(row, col)) available.push(col);
      continue;
    }
    
    if (userType === 'regular') {
      if (isVIP(row, col)) continue;
      if (isDisabilitySeat) continue;
      available.push(col);
    }
  }
  
  return available;
};

const findContiguousBlocks = (availableCols: number[]): number[][] => {
  const blocks: number[][] = [];
  let currentBlock: number[] = [];
  
  for (let i = 0; i < availableCols.length; i++) {
    if (currentBlock.length === 0) {
      currentBlock = [availableCols[i]];
    } else if (availableCols[i] === currentBlock[currentBlock.length - 1] + 1) {
      currentBlock.push(availableCols[i]);
    } else {
      if (currentBlock.length > 0) blocks.push([...currentBlock]);
      currentBlock = [availableCols[i]];
    }
  }
  if (currentBlock.length > 0) blocks.push(currentBlock);
  
  return blocks;
};

// Get total available seats count in a row for a user type
const getTotalAvailableInRow = (
  row: string,
  userType: 'regular' | 'vip' | 'disabled',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[]
): number => {
  let total = 0;
  const blocksToCheck = ['left', 'middle', 'right'] as const;
  for (const block of blocksToCheck) {
    const seats = getAvailableSeatsInBlock(
      row, block, brokenSeats, bookedSeats, disabilitySeats, userType
    );
    total += seats.length;
  }
  return total;
};

// Check if a seat is at the edge of its block
const isEdgeSeat = (col: number, allColsInBlock: number[]): boolean => {
  const firstCol = allColsInBlock[0];
  const lastCol = allColsInBlock[allColsInBlock.length - 1];
  return col === firstCol || col === lastCol;
};

// For SOLO customers (non-disabled) filtering
const isProblematicSoloSeat = (
  row: string,
  col: number,
  bookedSeats: string[],
  allColsInBlock: number[]
): boolean => {
  if (isEdgeSeat(col, allColsInBlock)) {
    return false;
  }
  
  const allSeatsAfterBooking = new Set([...bookedSeats, `${row}${col}`]);
  
  for (const checkCol of allColsInBlock) {
    const seatId = `${row}${checkCol}`;
    if (!allSeatsAfterBooking.has(seatId)) {
      const leftNeighbor = `${row}${checkCol - 1}`;
      const rightNeighbor = `${row}${checkCol + 1}`;
      const leftExists = allColsInBlock.includes(checkCol - 1);
      const rightExists = allColsInBlock.includes(checkCol + 1);
      
      const leftIsBlocked = !leftExists || allSeatsAfterBooking.has(leftNeighbor);
      const rightIsBlocked = !rightExists || allSeatsAfterBooking.has(rightNeighbor);
      
      if (leftIsBlocked && rightIsBlocked && !isEdgeSeat(checkCol, allColsInBlock)) {
        return true;
      }
    }
  }
  return false;
};

// Check if a solo would be trapped between groups
const wouldTrapSolo = (
  row: string,
  col: number,
  bookedSeats: string[]
): boolean => {
  const leftNeighbor = `${row}${col - 1}`;
  const rightNeighbor = `${row}${col + 1}`;
  
  if (bookedSeats.includes(leftNeighbor) && bookedSeats.includes(rightNeighbor)) {
    return true;
  }
  return false;
};

// For GROUPS (non-disabled) - check if booking would create scattered singles
const wouldCreateScatteredSingles = (
  row: string,
  candidateCols: number[],
  bookedSeats: string[],
  allColsInBlock: number[]
): boolean => {
  const allSeatsAfterBooking = new Set([...bookedSeats, ...candidateCols.map(c => `${row}${c}`)]);
  
  for (const col of allColsInBlock) {
    const seatId = `${row}${col}`;
    if (!allSeatsAfterBooking.has(seatId)) {
      const leftNeighbor = `${row}${col - 1}`;
      const rightNeighbor = `${row}${col + 1}`;
      const leftExists = allColsInBlock.includes(col - 1);
      const rightExists = allColsInBlock.includes(col + 1);
      
      const hasLeftNeighbor = leftExists && !allSeatsAfterBooking.has(leftNeighbor);
      const hasRightNeighbor = rightExists && !allSeatsAfterBooking.has(rightNeighbor);
      
      if (!hasLeftNeighbor && !hasRightNeighbor && !isEdgeSeat(col, allColsInBlock)) {
        return true;
      }
    }
  }
  return false;
};

// Find best row to split across for larger groups
const findClosestRows = (targetRow: string, availableRows: string[]): string[] => {
  const rowOrder = ['O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const targetIndex = rowOrder.indexOf(targetRow);
  
  return availableRows.sort((a, b) => {
    const indexA = rowOrder.indexOf(a);
    const indexB = rowOrder.indexOf(b);
    return Math.abs(indexA - targetIndex) - Math.abs(indexB - targetIndex);
  });
};


// FIND ALL AVAILABLE SEATING OPTIONS

export const findAllSeatOptions = (
  groupSize: number,
  userType: 'regular' | 'vip' | 'disabled',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[]
): { seats: string[]; message: string }[] => {
  
  const rows = ['O', 'N', 'M', 'L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const allOptions: { seats: string[]; message: string }[] = [];
  
  let blocksToSearch: ('left' | 'middle' | 'right')[] = [];
  
  if (userType === 'disabled') {
    blocksToSearch = ['left', 'middle', 'right'];
  } else if (userType === 'vip') {
    blocksToSearch = ['middle'];
  } else {
    blocksToSearch = ['left', 'middle', 'right'];
  }
  

  // DISABLED CUSTOMERS - NO restrictions on seat selection, but must be disability seats

  if (userType === 'disabled') {
    if (groupSize === 1) {
      for (const row of rows) {
        for (const block of blocksToSearch) {
          const availableCols = getAvailableSeatsInBlock(
            row, block, brokenSeats, bookedSeats, disabilitySeats, userType
          );
          for (const col of availableCols) {
            allOptions.push({
              seats: [`${row}${col}`],
              message: `Row ${row}, ${block} block, seat ${col}`
            });
          }
        }
      }
      return allOptions;
    }
    
    // Disabled groups - ANY combination
    for (const row of rows) {
      for (const block of blocksToSearch) {
        const availableCols = getAvailableSeatsInBlock(
          row, block, brokenSeats, bookedSeats, disabilitySeats, userType
        );
        
        if (availableCols.length >= groupSize) {
          const getAllCombinations = (arr: number[], size: number): number[][] => {
            const result: number[][] = [];
            const combine = (start: number, current: number[]) => {
              if (current.length === size) {
                result.push([...current]);
                return;
              }
              for (let i = start; i < arr.length; i++) {
                current.push(arr[i]);
                combine(i + 1, current);
                current.pop();
              }
            };
            combine(0, []);
            return result;
          };
          
          const combinations = getAllCombinations(availableCols, groupSize);
          for (const combo of combinations) {
            const seats = combo.map(col => `${row}${col}`);
            allOptions.push({
              seats,
              message: `Row ${row}, ${block} block, seats ${combo.join(', ')}`
            });
          }
        }
      }
    }
    
    return allOptions.filter((opt, idx, self) => 
      idx === self.findIndex(o => o.seats.join() === opt.seats.join())
    );
  }
  

  // NON-DISABLED CUSTOMERS (Regular & VIP)
  
  // PRIORITY 1: SOLO customers
  if (groupSize === 1) {
    for (const row of rows) {
      for (const block of blocksToSearch) {
        let allColsInBlock: number[] = [];
        if (block === 'left') allColsInBlock = [1, 2, 3, 4];
        else if (block === 'middle') allColsInBlock = getMiddleBlockCols(row);
        else if (block === 'right') allColsInBlock = [25, 26, 27, 28];
        
        const availableCols = getAvailableSeatsInBlock(
          row, block, brokenSeats, bookedSeats, disabilitySeats, userType
        );
        
        for (const col of availableCols) {
          if (userType !== 'vip' && wouldTrapSolo(row, col, bookedSeats)) {
            continue;
          }
          
          if (isProblematicSoloSeat(row, col, bookedSeats, allColsInBlock)) {
            continue;
          }
          
          allOptions.push({
            seats: [`${row}${col}`],
            message: `Row ${row}, ${block} block, seat ${col}`
          });
        }
      }
    }
    return allOptions;
  }
  
  // PRIORITY 1: Find group in a SINGLE BLOCK of a row
  for (const row of rows) {
    for (const block of blocksToSearch) {
      let allColsInBlock: number[] = [];
      if (block === 'left') allColsInBlock = [1, 2, 3, 4];
      else if (block === 'middle') allColsInBlock = getMiddleBlockCols(row);
      else if (block === 'right') allColsInBlock = [25, 26, 27, 28];
      
      const availableCols = getAvailableSeatsInBlock(
        row, block, brokenSeats, bookedSeats, disabilitySeats, userType
      );
      
      if (availableCols.length < groupSize) continue;
      
      const contiguousBlocks = findContiguousBlocks(availableCols);
      
      for (const blockCols of contiguousBlocks) {
        if (blockCols.length >= groupSize) {
          for (let start = 0; start <= blockCols.length - groupSize; start++) {
            const candidateCols = blockCols.slice(start, start + groupSize);
            
            if (wouldCreateScatteredSingles(row, candidateCols, bookedSeats, allColsInBlock)) {
              continue;
            }
            
            const seats = candidateCols.map(col => `${row}${col}`);
            allOptions.push({
              seats,
              message: `Row ${row}, ${block} block, seats ${candidateCols.join(', ')}`
            });
          }
        }
      }
    }
  }
  
  // If we found options in single blocks, return them
  if (allOptions.length > 0) {
    return allOptions;
  }
  
  // PRIORITY 2: Combine MULTIPLE BLOCKS in the SAME row
  for (const row of rows) {
    let allAvailableCols: number[] = [];
    
    for (const block of blocksToSearch) {
      const availableCols = getAvailableSeatsInBlock(
        row, block, brokenSeats, bookedSeats, disabilitySeats, userType
      );
      allAvailableCols = [...allAvailableCols, ...availableCols];
    }
    
    allAvailableCols.sort((a, b) => a - b);
    const contiguousBlocks = findContiguousBlocks(allAvailableCols);
    
    for (const blockCols of contiguousBlocks) {
      if (blockCols.length >= groupSize) {
        for (let start = 0; start <= blockCols.length - groupSize; start++) {
          const candidateCols = blockCols.slice(start, start + groupSize);
          
          // For combined blocks, we need a custom scattered check
          let hasScatteredIssue = false;
          const allSeatsAfterBooking = new Set([...bookedSeats, ...candidateCols.map(c => `${row}${c}`)]);
          
          for (const checkCol of allAvailableCols) {
            const seatId = `${row}${checkCol}`;
            if (!allSeatsAfterBooking.has(seatId)) {
              const leftNeighbor = `${row}${checkCol - 1}`;
              const rightNeighbor = `${row}${checkCol + 1}`;
              const leftExists = allAvailableCols.includes(checkCol - 1);
              const rightExists = allAvailableCols.includes(checkCol + 1);
              
              const hasLeftNeighbor = leftExists && !allSeatsAfterBooking.has(leftNeighbor);
              const hasRightNeighbor = rightExists && !allSeatsAfterBooking.has(rightNeighbor);
              
              if (!hasLeftNeighbor && !hasRightNeighbor) {
                hasScatteredIssue = true;
                break;
              }
            }
          }
          
          if (!hasScatteredIssue) {
            const seats = candidateCols.map(col => `${row}${col}`);
            allOptions.push({
              seats,
              message: `Row ${row}, combined blocks, seats ${candidateCols.join(', ')}`
            });
          }
        }
      }
    }
  }
  
  // If we found options combining blocks, return them
  if (allOptions.length > 0) {
    return allOptions;
  }
  
  // PRIORITY 3: Split across MULTIPLE ROWS (closest rows first)
  // First, check total available seats across all rows
  let totalAvailable = 0;
  for (const row of rows) {
    totalAvailable += getTotalAvailableInRow(row, userType, brokenSeats, bookedSeats, disabilitySeats);
  }
  
  if (totalAvailable >= groupSize) {
    let remainingToBook = groupSize;
    const allSeats: string[] = [];
    
    // For each starting row, try to fill contiguous rows
    for (let startRowIdx = 0; startRowIdx < rows.length; startRowIdx++) {
      const tempSeats: string[] = [];
      let tempRemaining = groupSize;
      
      for (let offset = 0; offset < rows.length && tempRemaining > 0; offset++) {
        const rowIdx = startRowIdx + offset;
        if (rowIdx >= rows.length) break;
        
        const row = rows[rowIdx];
        let availableCols: number[] = [];
        
        for (const block of blocksToSearch) {
          const cols = getAvailableSeatsInBlock(
            row, block, brokenSeats, bookedSeats, disabilitySeats, userType
          );
          availableCols = [...availableCols, ...cols];
        }
        availableCols.sort((a, b) => a - b);
        
        if (availableCols.length > 0) {
          const takeCount = Math.min(availableCols.length, tempRemaining);
          const seatsToTake = availableCols.slice(0, takeCount).map(col => `${row}${col}`);
          tempSeats.push(...seatsToTake);
          tempRemaining -= takeCount;
        }
      }
      
      if (tempSeats.length === groupSize && (allSeats.length === 0 || tempSeats.length > allSeats.length)) {
        allSeats.length = 0;
        allSeats.push(...tempSeats);
      }
    }
    
    if (allSeats.length === groupSize) {
      allOptions.push({
        seats: allSeats,
        message: `Split ${groupSize} seats across multiple rows`
      });
    }
  }
  
  const uniqueOptions = allOptions.filter((option, index, self) => 
    index === self.findIndex(o => o.seats.join() === option.seats.join())
  );
  
  return uniqueOptions;
};


// PROGRESSIVE SEAT SELECTION FUNCTIONS

export const getAllValidOptions = (
  groupSize: number,
  userType: 'regular' | 'vip' | 'disabled',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[]
): { seats: string[]; message: string }[] => {
  return findAllSeatOptions(groupSize, userType, brokenSeats, bookedSeats, disabilitySeats);
};

export const getAllPossibleSeats = (
  groupSize: number,
  userType: 'regular' | 'vip' | 'disabled',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[]
): string[] => {
  const options = findAllSeatOptions(groupSize, userType, brokenSeats, bookedSeats, disabilitySeats);
  const allSeats: string[] = [];
  for (const option of options) {
    allSeats.push(...option.seats);
  }
  return [...new Set(allSeats)];
};

export const filterOptionsBySelection = (
  allOptions: { seats: string[]; message: string }[],
  selectedSeats: string[]
): { seats: string[]; message: string }[] => {
  if (selectedSeats.length === 0) return allOptions;
  
  return allOptions.filter(option =>
    selectedSeats.every(seat => option.seats.includes(seat))
  );
};

export const getAvailableSeatsForNextPick = (
  allOptions: { seats: string[]; message: string }[],
  selectedSeats: string[]
): string[] => {
  const validOptions = filterOptionsBySelection(allOptions, selectedSeats);
  
  if (validOptions.length === 0) return [];
  
  const allSeats: string[] = [];
  for (const option of validOptions) {
    allSeats.push(...option.seats);
  }
  
  return [...new Set(allSeats.filter(seat => !selectedSeats.includes(seat)))];
};

export const isCompleteGroup = (
  allOptions: { seats: string[]; message: string }[],
  selectedSeats: string[]
): boolean => {
  if (selectedSeats.length === 0) return false;
  
  return allOptions.some(option =>
    option.seats.length === selectedSeats.length &&
    selectedSeats.every(seat => option.seats.includes(seat))
  );
};

export const getMatchingOption = (
  allOptions: { seats: string[]; message: string }[],
  selectedSeats: string[]
): { seats: string[]; message: string } | null => {
  const matching = allOptions.find(option =>
    option.seats.length === selectedSeats.length &&
    selectedSeats.every(seat => option.seats.includes(seat))
  );
  return matching || null;
};

export const canAddSeatToSelection = (
  allOptions: { seats: string[]; message: string }[],
  currentSelection: string[],
  newSeat: string
): boolean => {
  return allOptions.some(option =>
    [...currentSelection, newSeat].every(seat => option.seats.includes(seat))
  );
};


// SEAT SELECTABILITY

export const isSeatSelectable = (
  row: string,
  col: number,
  adminOverride: boolean,
  userType: 'regular' | 'vip' | 'disabled',
  brokenSeats: string[],
  bookedSeats: string[],
  disabilitySeats: string[]
): boolean => {
  const seatId = `${row}${col}`;
  const isDisabilitySeat = disabilitySeats.includes(seatId);
  
  if (isMissingSeat(row, col)) return false;
  if (brokenSeats.includes(seatId)) return false;
  if (bookedSeats.includes(seatId)) return false;
  
  if (adminOverride) return true;
  
  if (userType === 'disabled') {
    return isDisabilitySeat;
  }
  
  if (userType === 'vip') {
    return isVIP(row, col);
  }
  
  if (isVIP(row, col)) return false;
  if (isDisabilitySeat) return false;
  
  return true;
};


// BOOKING FUNCTIONS

export const bookSeats = (
  selectedSeats: string[],
  bookedSeats: string[]
): { newBookedSeats: string[]; message: string } => {
  if (selectedSeats.length === 0) {
    return { newBookedSeats: bookedSeats, message: "Please select seats first" };
  }
  
  const newBookedSeats = [...bookedSeats, ...selectedSeats];
  return { 
    newBookedSeats, 
    message: `` 
  };
};