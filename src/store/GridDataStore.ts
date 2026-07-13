import { IGridDataStore } from './IGridDataStore';
import { CellModel } from '../models/CellModel';

export class GridDataStore implements IGridDataStore {
    private cells: Map<string, CellModel> = new Map();
    private rowHeights: Map<number, number> = new Map();
    private colWidths: Map<number, number> = new Map();
    
    private readonly defaultRowHeight = 24;
    private readonly defaultColWidth = 100;
    
    private rowCount = 100000;
    private colCount = 500;
    
    // Maps a cell key to a list of cell keys that depend on it
    private dependents: Map<string, Set<string>> = new Map();
    // Maps a cell key to a list of cell keys it depends on (used for clearing)
    private dependencies: Map<string, Set<string>> = new Map();

    private getCellKey(row: number, col: number): string {
        return `${row},${col}`;
    }

    getCell(row: number, col: number): CellModel | null {
        return this.cells.get(this.getCellKey(row, col)) || null;
    }

    setCell(row: number, col: number, cell: CellModel): void {
        this.cells.set(this.getCellKey(row, col), cell);
    }

    getRowHeight(row: number): number {
        return this.rowHeights.get(row) || this.defaultRowHeight;
    }

    setRowHeight(row: number, height: number): void {
        this.rowHeights.set(row, height);
    }

    getColumnWidth(col: number): number {
        return this.colWidths.get(col) || this.defaultColWidth;
    }

    setColumnWidth(col: number, width: number): void {
        this.colWidths.set(col, width);
    }

    getRowCount(): number {
        return this.rowCount;
    }

    getColumnCount(): number {
        return this.colCount;
    }

    addDependency(targetRow: number, targetCol: number, dependsOnRow: number, dependsOnCol: number): void {
        const targetKey = this.getCellKey(targetRow, targetCol);
        const dependsOnKey = this.getCellKey(dependsOnRow, dependsOnCol);

        if (!this.dependents.has(dependsOnKey)) {
            this.dependents.set(dependsOnKey, new Set());
        }
        this.dependents.get(dependsOnKey)!.add(targetKey);

        if (!this.dependencies.has(targetKey)) {
            this.dependencies.set(targetKey, new Set());
        }
        this.dependencies.get(targetKey)!.add(dependsOnKey);
    }

    clearDependencies(row: number, col: number): void {
        const targetKey = this.getCellKey(row, col);
        const deps = this.dependencies.get(targetKey);
        
        if (deps) {
            deps.forEach(dependsOnKey => {
                const dependentsSet = this.dependents.get(dependsOnKey);
                if (dependentsSet) {
                    dependentsSet.delete(targetKey);
                }
            });
            this.dependencies.delete(targetKey);
        }
    }

    getDependents(row: number, col: number): Array<{row: number, col: number}> {
        const key = this.getCellKey(row, col);
        const deps = this.dependents.get(key);
        if (!deps) return [];
        
        return Array.from(deps).map(k => {
            const [r, c] = k.split(',').map(Number);
            return { row: r, col: c };
        });
    }
}
