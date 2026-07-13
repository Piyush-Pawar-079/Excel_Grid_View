import { IGridDataStore } from '../store/IGridDataStore';

export class ViewportManager {
    public scrollX: number = 0;
    public scrollY: number = 0;
    public viewportWidth: number = 0;
    public viewportHeight: number = 0;
    
    public readonly headerHeight = 24;
    public readonly headerWidth = 40;

    constructor(private store: IGridDataStore) {}

    public updateViewportSize(width: number, height: number) {
        this.viewportWidth = width;
        this.viewportHeight = height;
    }

    public handleScroll(deltaX: number, deltaY: number) {
        this.scrollX = Math.max(0, this.scrollX + deltaX);
        this.scrollY = Math.max(0, this.scrollY + deltaY);
        // Could bound max scroll based on total width/height if calculated
    }

    public getVisibleRange(): { startRow: number, endRow: number, startCol: number, endCol: number } {
        let startRow = 0;
        let currentY = 0;
        
        while (startRow < this.store.getRowCount()) {
            const h = this.store.getRowHeight(startRow);
            if (currentY + h > this.scrollY) break;
            currentY += h;
            startRow++;
        }

        let endRow = startRow;
        let drawnY = currentY - this.scrollY + this.headerHeight;
        while (endRow < this.store.getRowCount() && drawnY < this.viewportHeight) {
            drawnY += this.store.getRowHeight(endRow);
            endRow++;
        }

        let startCol = 0;
        let currentX = 0;
        
        while (startCol < this.store.getColumnCount()) {
            const w = this.store.getColumnWidth(startCol);
            if (currentX + w > this.scrollX) break;
            currentX += w;
            startCol++;
        }

        let endCol = startCol;
        let drawnX = currentX - this.scrollX + this.headerWidth;
        while (endCol < this.store.getColumnCount() && drawnX < this.viewportWidth) {
            drawnX += this.store.getColumnWidth(endCol);
            endCol++;
        }

        return { startRow, endRow, startCol, endCol };
    }

    // Convert screen coordinates to row/col
    public getCellAt(x: number, y: number): { row: number, col: number } | null {
        if (x < this.headerWidth || y < this.headerHeight) {
            // Click on header, ignore for cell get
            // In a real app we'd return negative values or specialized types
            return null;
        }

        const adjustedX = x - this.headerWidth + this.scrollX;
        const adjustedY = y - this.headerHeight + this.scrollY;

        let col = 0;
        let currX = 0;
        while (col < this.store.getColumnCount()) {
            const w = this.store.getColumnWidth(col);
            if (currX + w > adjustedX) break;
            currX += w;
            col++;
        }

        let row = 0;
        let currY = 0;
        while (row < this.store.getRowCount()) {
            const h = this.store.getRowHeight(row);
            if (currY + h > adjustedY) break;
            currY += h;
            row++;
        }

        return { row, col };
    }
}
