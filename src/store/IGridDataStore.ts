import { CellModel } from '../models/CellModel';

export interface IGridDataStore {
    getCell(row: number, col: number): CellModel | null;
    setCell(row: number, col: number, cell: CellModel): void;
    
    getRowHeight(row: number): number;
    setRowHeight(row: number, height: number): void;
    
    getColumnWidth(col: number): number;
    setColumnWidth(col: number, width: number): void;
    
    getRowCount(): number;
    getColumnCount(): number;
    
    // Dependency tracking for basic formula recalculation
    addDependency(targetRow: number, targetCol: number, dependsOnRow: number, dependsOnCol: number): void;
    clearDependencies(row: number, col: number): void;
    getDependents(row: number, col: number): Array<{row: number, col: number}>;
}
