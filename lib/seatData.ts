import { isVIP } from './vipSeats';

export const getCenteredMiddleBlock = (row: string): number[] => {
    const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
    const removeCountMap: Record<string, number> = {
        'F': 1, 'G': 2, 'H': 3, 'I': 4, 'J': 5, 'K': 6, 'L': 7, 'M': 8, 'N': 9, 'O': 10,
    };
    const removeCount = removeCountMap[row] || 0;
    if (removeCount === 0) return allMiddleCols;
    
    const seatsToKeep = allMiddleCols.length - removeCount;
    const removeFromStart = Math.floor(removeCount / 2);
    return allMiddleCols.slice(removeFromStart, removeFromStart + seatsToKeep);
};

export const isMissingSeat = (row: string, col: number): boolean => {
    if (row === 'A') {
        return [3, 4, 25, 26].includes(col);
    }
    return false;
};

export const getColumnsForRow = (row: string) => {
    if (row === 'A') {
        return {
        left: [1, 2],
        middle: Array.from({ length: 20 }, (_, i) => i + 5),
        right: [27, 28],
        leftMissing: [3, 4],
        rightMissing: [25, 26],
        };
    }
    
    if (['B', 'C', 'D'].includes(row)) {
        return {
        left: [1, 2, 3, 4],
        middle: Array.from({ length: 20 }, (_, i) => i + 5),
        right: [25, 26, 27, 28],
        };
    }
    
    if (row === 'E') {
        return {
        left: [1, 2, 3, 4],
        middle: Array.from({ length: 20 }, (_, i) => i + 5),
        right: [25, 26, 27, 28],
        };
    }
    
    if (['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].includes(row)) {
        const middle = getCenteredMiddleBlock(row);
        const allMiddle = Array.from({ length: 20 }, (_, i) => i + 5);
        const missingMiddle = allMiddle.filter(col => !middle.includes(col));
        return {
        left: [1, 2, 3, 4],
        middle,
        right: [25, 26, 27, 28],
        missingMiddle,
        needsCentering: true,
        };
    }
    
    return { left: [], middle: [], right: [] };
};