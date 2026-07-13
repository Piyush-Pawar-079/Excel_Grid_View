import { IGridDataStore } from '../store/IGridDataStore';
import { ViewportManager } from '../core/ViewportManager';
import { SelectionManager } from '../core/SelectionManager';
import { CellUtils } from '../utils/CellUtils';

export class GridRenderer {
    private ctx: CanvasRenderingContext2D;
    
    // Excel-like Colors

    private readonly gridLineColor = '#d9d9d9';

    private readonly headerBg = '#f3f3f3';
    private readonly headerText = '#444444';
    private readonly headerBorder = '#d9d9d9';

    private readonly cellText = '#202124';

    private readonly errorText = '#ff0000';

    private readonly selectionBorder = '#21A366';
    private readonly selectionBg = 'rgba(33, 163, 102, 0.12)';
    
    constructor(
        private canvas: HTMLCanvasElement,
        private store: IGridDataStore,
        private viewport: ViewportManager,
        private selection: SelectionManager
    ) {
        this.ctx = this.canvas.getContext('2d')!;
    }

    public render() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const { startRow, endRow, startCol, endCol } = this.viewport.getVisibleRange();

        this.ctx.save();
        this.ctx.translate(
            this.viewport.headerWidth - this.viewport.scrollX,
            this.viewport.headerHeight - this.viewport.scrollY
        );

        // 1. Draw cells
        this.drawCells(startRow, endRow, startCol, endCol);

        // 2. Draw selections
        this.drawSelections();

        this.ctx.restore();

        // 3. Draw Headers (fixed position)
        this.drawHeaders(startRow, endRow, startCol, endCol);
    }

    private drawCells(startRow: number, endRow: number, startCol: number, endCol: number) {
        let currentY = 0;
        for (let r = 0; r < startRow; r++) currentY += this.store.getRowHeight(r);

        for (let r = startRow; r <= endRow; r++) {
            if (r >= this.store.getRowCount()) break;
            const h = this.store.getRowHeight(r);
            
            let currentX = 0;
            for (let c = 0; c < startCol; c++) currentX += this.store.getColumnWidth(c);

            for (let c = startCol; c <= endCol; c++) {
                if (c >= this.store.getColumnCount()) break;
                const w = this.store.getColumnWidth(c);
                
                // Draw Cell Border
                this.ctx.strokeStyle = this.gridLineColor;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(currentX, currentY, w, h);
                
                // Draw Cell Text
                const cell = this.store.getCell(r, c);
                if (cell && cell.computedValue !== null) {
                    this.ctx.fillStyle = cell.hasError ? this.errorText : this.cellText;
                    this.ctx.font = '14px Arial';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.textAlign = 'left';
                    
                    // Simple clipping per cell
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.rect(currentX, currentY, w, h);
                    this.ctx.clip();
                    
                    this.ctx.fillText(
                        cell.computedValue.toString(), 
                        currentX + 8, 
                        currentY + h / 2
                    );
                    this.ctx.restore();
                }

                currentX += w;
            }
            currentY += h;
        }
    }

    private drawSelections() {
        const sel = this.selection.getSelectionRange();
        
        let startX = 0;
        for (let c = 0; c < sel.minCol; c++) startX += this.store.getColumnWidth(c);
        let endX = startX;
        for (let c = sel.minCol; c <= sel.maxCol; c++) endX += this.store.getColumnWidth(c);

        let startY = 0;
        for (let r = 0; r < sel.minRow; r++) startY += this.store.getRowHeight(r);
        let endY = startY;
        for (let r = sel.minRow; r <= sel.maxRow; r++) endY += this.store.getRowHeight(r);

        // Draw range selection area
        this.ctx.fillStyle = this.selectionBg;
        this.ctx.fillRect(startX, startY, endX - startX, endY - startY);
        
        this.ctx.strokeStyle = this.selectionBorder;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);

        // Draw active cell border differently if needed, here just highlighting range
    }

    private drawHeaders(startRow: number, endRow: number, startCol: number, endCol: number) {
        // Draw top left corner
        this.ctx.fillStyle = this.headerBg;
        this.ctx.fillRect(0, 0, this.viewport.headerWidth, this.viewport.headerHeight);
        this.ctx.strokeStyle = this.headerBorder;
        this.ctx.strokeRect(0, 0, this.viewport.headerWidth, this.viewport.headerHeight);

        this.ctx.fillStyle = this.headerText;
        this.ctx.font = '12px Arial';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        // Column headers
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.viewport.headerWidth, 0, this.canvas.width - this.viewport.headerWidth, this.viewport.headerHeight);
        this.ctx.clip();

        let currentX = this.viewport.headerWidth - this.viewport.scrollX;
        for (let c = 0; c < startCol; c++) currentX += this.store.getColumnWidth(c);

        for (let c = startCol; c <= endCol; c++) {
            if (c >= this.store.getColumnCount()) break;
            const w = this.store.getColumnWidth(c);
            
            this.ctx.fillStyle = this.headerBg;
            this.ctx.fillRect(currentX, 0, w, this.viewport.headerHeight);
            this.ctx.strokeRect(currentX, 0, w, this.viewport.headerHeight);
            
            this.ctx.fillStyle = this.headerText;
            this.ctx.fillText(CellUtils.toColumnName(c), currentX + w / 2, this.viewport.headerHeight / 2);
            
            currentX += w;
        }
        this.ctx.restore();

        // Row headers
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(0, this.viewport.headerHeight, this.viewport.headerWidth, this.canvas.height - this.viewport.headerHeight);
        this.ctx.clip();

        let currentY = this.viewport.headerHeight - this.viewport.scrollY;
        for (let r = 0; r < startRow; r++) currentY += this.store.getRowHeight(r);

        for (let r = startRow; r <= endRow; r++) {
            if (r >= this.store.getRowCount()) break;
            const h = this.store.getRowHeight(r);
            
            this.ctx.fillStyle = this.headerBg;
            this.ctx.fillRect(0, currentY, this.viewport.headerWidth, h);
            this.ctx.strokeRect(0, currentY, this.viewport.headerWidth, h);
            
            this.ctx.fillStyle = this.headerText;
            this.ctx.fillText((r + 1).toString(), this.viewport.headerWidth / 2, currentY + h / 2);
            
            currentY += h;
        }
        this.ctx.restore();
    }
}
