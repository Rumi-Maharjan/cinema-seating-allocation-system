export interface Seat {
    id: string;
    row: string;
    col: number;
    type: 'regular' | 'vip' | 'disability';
    status: 'available' | 'booked' | 'broken';
    isMissing?: boolean;
}