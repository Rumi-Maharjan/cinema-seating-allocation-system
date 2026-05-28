export const getValidDisabilitySeatsForRow = (row: string): number[] => {
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
export const generateDisabilitySeats = (): string[] => {
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