export class SelectionManager {
    public activeRow: number = 0;
    public activeCol: number = 0;
    
    // For range selection, these track the start and end of the drag
    public startRow: number = 0;
    public startCol: number = 0;
    public endRow: number = 0;
    public endCol: number = 0;

    public isSelecting: boolean = false;

    public setActiveCell(row: number, col: number) {
        this.activeRow = row;
        this.activeCol = col;
        this.startRow = row;
        this.startCol = col;
        this.endRow = row;
        this.endCol = col;
    }

    public beginSelection(row: number, col: number) {
        this.isSelecting = true;
        this.setActiveCell(row, col);
    }

    public updateSelection(row: number, col: number) {
        if (this.isSelecting) {
            this.endRow = row;
            this.endCol = col;
        }
    }

    public endSelection() {
        this.isSelecting = false;
    }

    public getSelectionRange() {
        return {
            minRow: Math.min(this.startRow, this.endRow),
            maxRow: Math.max(this.startRow, this.endRow),
            minCol: Math.min(this.startCol, this.endCol),
            maxCol: Math.max(this.startCol, this.endCol)
        };
    }
}
