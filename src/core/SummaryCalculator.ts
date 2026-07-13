import { IGridDataStore } from '../store/IGridDataStore';

export interface SummaryStats {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
}

export class SummaryCalculator {
    constructor(private store: IGridDataStore) {}

    public calculate(startRow: number, endRow: number, startCol: number, endCol: number): SummaryStats | null {
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        
        let hasData = false;

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const cell = this.store.getCell(r, c);
                if (cell && cell.computedValue !== null && cell.computedValue !== '') {
                    hasData = true;
                    count++;
                    
                    const numValue = Number(cell.computedValue);
                    if (!isNaN(numValue)) {
                        sum += numValue;
                        if (numValue < min) min = numValue;
                        if (numValue > max) max = numValue;
                    }
                }
            }
        }

        if (!hasData) return null;

        return {
            count,
            sum,
            avg: count > 0 ? sum / count : 0,
            min: min === Infinity ? 0 : min,
            max: max === -Infinity ? 0 : max
        };
    }
}
