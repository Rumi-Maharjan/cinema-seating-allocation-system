export const getVIPSeats = (row: string): number[] => {
    const vipCountMap: Record<string, number> = {
        E: 12,
        F: 13,
        G: 14,
        H: 15,
    };

    const vipCount = vipCountMap[row] || 0;
    if (vipCount === 0) return [];

    const allMiddleCols = Array.from({ length: 20 }, (_, i) => i + 5);
    const startIndex = Math.floor((allMiddleCols.length - vipCount) / 2);

    return allMiddleCols.slice(startIndex, startIndex + vipCount);
};

export const isVIP = (row: string, col: number): boolean => {
    const vipSeats = getVIPSeats(row);
    return vipSeats.includes(col);
};
