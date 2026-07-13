import { IGridDataStore } from '../store/IGridDataStore';
import { ViewportManager } from './ViewportManager';
import { SelectionManager } from './SelectionManager';
import { EditManager } from './EditManager';
import { SummaryCalculator } from './SummaryCalculator';
import { GridRenderer } from '../render/GridRenderer';
import { CommandManager } from '../commands/CommandManager';
import { EditCellCommand } from '../commands/EditCellCommand';
import { CellModel } from '../models/CellModel';
import { FormulaEvaluator } from '../formula/FormulaEvaluator';
import { CellUtils } from '../utils/CellUtils';
import { ResizeColumnCommand } from '../commands/ResizeColumnCommand';
import { ResizeRowCommand } from '../commands/ResizeRowCommand';

export class Grid {
    private canvas: HTMLCanvasElement;
    private wrapper: HTMLDivElement;
    
    public viewport: ViewportManager;
    public selection: SelectionManager;
    public editor: EditManager;
    public summary: SummaryCalculator;
    public renderer: GridRenderer;
    public commands: CommandManager;
    public evaluator: FormulaEvaluator;

    private dragMode: 'col' | 'row' | 'cell' | null = null;
    private resizeMode: 'col' | 'row' | null = null;
    private resizeIndex = -1;
    private resizeStartPos = 0;
    private resizeStartSize = 0;

    constructor(private store: IGridDataStore) {
        this.canvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
        this.wrapper = document.getElementById('gridWrapper') as HTMLDivElement;
        
        this.viewport = new ViewportManager(store);
        this.selection = new SelectionManager();
        this.summary = new SummaryCalculator(store);
        this.commands = new CommandManager();
        this.evaluator = new FormulaEvaluator(store);
        
        this.editor = new EditManager(
            store, 
            this.viewport, 
            (r, c, val) => this.commitEdit(r, c, val),
            () => this.renderer.render() // refocus canvas if needed
        );
        
        this.renderer = new GridRenderer(this.canvas, store, this.viewport, this.selection);
        
        this.initEvents();
        this.resize();
        this.updateScrollSize();
        
        // Start animation loop for smooth scrolling or just render on demand
        this.renderer.render();
    }

    private updateScrollSize() {
        let totalW = 0;
        let totalH = 0;
        for (let c = 0; c < this.store.getColumnCount(); c++) totalW += this.store.getColumnWidth(c);
        for (let r = 0; r < this.store.getRowCount(); r++) totalH += this.store.getRowHeight(r);
        
        const spacer = document.getElementById('spacer');
        if (spacer) {
            spacer.style.width = `${totalW}px`;
            spacer.style.height = `${totalH}px`;
        }
    }

    private commitEdit(row: number, col: number, rawValue: string) {
        const newCell = this.evaluateCell(row, col, rawValue);
        
        const cmd = new EditCellCommand(this.store, row, col, newCell, (r, c, val) => this.evaluateCell(r, c, val));
        this.commands.execute(cmd);
        
        this.recalculateDependents(row, col);
        this.updateUI();
    }

    private evaluateCell(row: number, col: number, rawValue: string): CellModel {
        this.store.clearDependencies(row, col); // clear old
        
        let computedValue: string | number | null = rawValue;
        let hasError = false;
        let errorType: any;

        if (rawValue.startsWith('=')) {
            const result = this.evaluator.evaluate(rawValue, row, col);
            if (typeof result === 'string' && result.startsWith('#')) {
                hasError = true;
                errorType = result;
                computedValue = result;
            } else {
                computedValue = result;
            }
        } else {
            // Check if numeric
            const num = Number(rawValue);
            if (rawValue.trim() !== '' && !isNaN(num)) {
                computedValue = num;
            }
        }

        return {
            row, col, rawValue, computedValue, hasError, errorType
        };
    }

    private recalculateDependents(row: number, col: number) {
        const queue = [...this.store.getDependents(row, col)];
        const visited = new Set<string>();
        
        while (queue.length > 0) {
            const dep = queue.shift()!;
            const key = `${dep.row},${dep.col}`;
            if (visited.has(key)) continue;
            visited.add(key);

            const cell = this.store.getCell(dep.row, dep.col);
            if (cell && cell.rawValue.startsWith('=')) {
                const updatedCell = this.evaluateCell(dep.row, dep.col, cell.rawValue);
                this.store.setCell(dep.row, dep.col, updatedCell);
                
                queue.push(...this.store.getDependents(dep.row, dep.col));
            }
        }
    }

    private resize() {
        const rect = this.wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.viewport.updateViewportSize(rect.width, rect.height);
        this.editor.updatePositionIfEditing();
        this.renderer.render();
    }

    private updateUI() {
        this.renderer.render();
        
        // Update status bar
        const sel = this.selection.getSelectionRange();
        const stats = this.summary.calculate(sel.minRow, sel.maxRow, sel.minCol, sel.maxCol);
        
        document.getElementById('statCount')!.textContent = `Count: ${stats ? stats.count : 0}`;
        document.getElementById('statSum')!.textContent = `Sum: ${stats ? stats.sum : 0}`;
        document.getElementById('statAvg')!.textContent = `Avg: ${stats ? stats.avg.toFixed(2) : 0}`;
        document.getElementById('statMin')!.textContent = `Min: ${stats ? stats.min : 0}`;
        document.getElementById('statMax')!.textContent = `Max: ${stats ? stats.max : 0}`;
        
        document.getElementById('selectionRangeSpan')!.textContent = CellUtils.toCellReference(this.selection.activeRow, this.selection.activeCol);
        
        const activeCell = this.store.getCell(this.selection.activeRow, this.selection.activeCol);
        const formulaSpan = document.getElementById('currentInputField');
        if (formulaSpan) formulaSpan.textContent = activeCell ? activeCell.rawValue : '';
    }

    private initEvents() {
        const scrollBox = document.getElementById('scrollBox') as HTMLDivElement;
        scrollBox.addEventListener('scroll', () => {
            this.viewport.scrollX = scrollBox.scrollLeft;
            this.viewport.scrollY = scrollBox.scrollTop;
            this.editor.updatePositionIfEditing();
            this.updateUI();
        });

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // Undo/Redo buttons
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            this.commands.undo();
            this.updateUI();
        });
        document.getElementById('redoBtn')?.addEventListener('click', () => {
            this.commands.redo();
            this.updateUI();
        });

        // Global keyboard handling for canvas (need to make canvas focusable or listen on window if active)
        window.addEventListener('keydown', (e) => {
            if (document.activeElement === this.canvas || document.activeElement === document.body) {
                if (e.ctrlKey && e.key === 'z') {
                    this.commands.undo();
                    this.updateUI();
                    e.preventDefault();
                } else if (e.ctrlKey && e.key === 'y') {
                    this.commands.redo();
                    this.updateUI();
                    e.preventDefault();
                } else if (e.key.startsWith('Arrow')) {
                    this.handleArrowKeys(e);
                    e.preventDefault();
                } else if (e.key === 'Enter') {
                    this.editor.beginEdit(this.selection.activeRow, this.selection.activeCol);
                    e.preventDefault();
                } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                    // Start typing in edit mode
                    this.editor.beginEdit(this.selection.activeRow, this.selection.activeCol);
                    const editorInput = document.getElementById('cellEditor') as HTMLInputElement;
                    editorInput.value = ''; // clear and let it capture the character
                }
            }
        });

        // Make canvas focusable by clicking
        this.canvas.tabIndex = 1;
    }
    
    private handleArrowKeys(e: KeyboardEvent) {
        let { activeRow, activeCol } = this.selection;
        
        if (e.key === 'ArrowUp') activeRow = Math.max(0, activeRow - 1);
        if (e.key === 'ArrowDown') activeRow = Math.min(this.store.getRowCount() - 1, activeRow + 1);
        if (e.key === 'ArrowLeft') activeCol = Math.max(0, activeCol - 1);
        if (e.key === 'ArrowRight') activeCol = Math.min(this.store.getColumnCount() - 1, activeCol + 1);
        
        if (e.shiftKey) {
            this.selection.isSelecting = true;
            this.selection.updateSelection(activeRow, activeCol);
            this.selection.isSelecting = false; // end right away just for range expansion
        } else {
            this.selection.setActiveCell(activeRow, activeCol);
        }
        
        this.scrollToCell(activeRow, activeCol);
        
        this.updateUI();
    }

    private scrollToCell(row: number, col: number) {
        let cellY = 0;
        for (let r = 0; r < row; r++) {
            cellY += this.store.getRowHeight(r);
        }
        const cellH = this.store.getRowHeight(row);
        
        let cellX = 0;
        for (let c = 0; c < col; c++) {
            cellX += this.store.getColumnWidth(c);
        }
        const cellW = this.store.getColumnWidth(col);

        const viewWidth = this.viewport.viewportWidth - this.viewport.headerWidth;
        const viewHeight = this.viewport.viewportHeight - this.viewport.headerHeight;

        const scrollBox = document.getElementById('scrollBox') as HTMLDivElement;

        if (cellY < scrollBox.scrollTop) {
            scrollBox.scrollTop = cellY;
        } else if (cellY + cellH > scrollBox.scrollTop + viewHeight) {
            scrollBox.scrollTop = cellY + cellH - viewHeight;
        }

        if (cellX < scrollBox.scrollLeft) {
            scrollBox.scrollLeft = cellX;
        } else if (cellX + cellW > scrollBox.scrollLeft + viewWidth) {
            scrollBox.scrollLeft = cellX + cellW - viewWidth;
        }
    }

    private handleMouseDown(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check for resize headers
        if (y < this.viewport.headerHeight && x > this.viewport.headerWidth) {
            // Column resize?
            let currentX = this.viewport.headerWidth - this.viewport.scrollX;
            for (let c = 0; c < this.store.getColumnCount(); c++) {
                currentX += this.store.getColumnWidth(c);
                if (Math.abs(x - currentX) < 5) {
                    this.resizeMode = 'col';
                    this.resizeIndex = c;
                    this.resizeStartPos = e.clientX;
                    this.resizeStartSize = this.store.getColumnWidth(c);
                    return;
                }
                if (currentX > x + 5) break;
            }

            // Col Selection
            const cellPos = this.viewport.getCellAt(x, this.viewport.headerHeight + 5);
            if (cellPos) {
                this.selection.beginSelection(0, cellPos.col);
                this.selection.updateSelection(this.store.getRowCount() - 1, cellPos.col);
                this.dragMode = 'col';
                this.updateUI();
                return;
            }
        }
        
        if (x < this.viewport.headerWidth && y > this.viewport.headerHeight) {
            // Row resize?
            let currentY = this.viewport.headerHeight - this.viewport.scrollY;
            for (let r = 0; r < this.store.getRowCount(); r++) {
                currentY += this.store.getRowHeight(r);
                if (Math.abs(y - currentY) < 5) {
                    this.resizeMode = 'row';
                    this.resizeIndex = r;
                    this.resizeStartPos = e.clientY;
                    this.resizeStartSize = this.store.getRowHeight(r);
                    return;
                }
                if (currentY > y + 5) break;
            }

            // Row Selection
            const cellPos = this.viewport.getCellAt(this.viewport.headerWidth + 5, y);
            if (cellPos) {
                this.selection.beginSelection(cellPos.row, 0);
                this.selection.updateSelection(cellPos.row, this.store.getColumnCount() - 1);
                this.dragMode = 'row';
                this.updateUI();
                return;
            }
        }

        const cellPos = this.viewport.getCellAt(x, y);
        if (cellPos) {
            this.dragMode = 'cell';
            this.selection.beginSelection(cellPos.row, cellPos.col);
            this.updateUI();
        }
    }

    private handleMouseMove(e: MouseEvent) {
        if (this.resizeMode === 'col') {
            this.canvas.style.cursor = 'col-resize';
            const diff = e.clientX - this.resizeStartPos;
            const newSize = Math.max(40, this.resizeStartSize + diff);
            this.store.setColumnWidth(this.resizeIndex, newSize);
            this.updateScrollSize();
            this.updateUI();
            return;
        }
        if (this.resizeMode === 'row') {
            this.canvas.style.cursor = 'row-resize';
            const diff = e.clientY - this.resizeStartPos;
            const newSize = Math.max(24, this.resizeStartSize + diff);
            this.store.setRowHeight(this.resizeIndex, newSize);
            this.updateScrollSize();
            this.updateUI();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let cursor = 'default';

        if (y < this.viewport.headerHeight && x > this.viewport.headerWidth) {
            let currentX = this.viewport.headerWidth - this.viewport.scrollX;
            for (let c = 0; c < this.store.getColumnCount(); c++) {
                currentX += this.store.getColumnWidth(c);
                if (Math.abs(x - currentX) < 5) {
                    cursor = 'col-resize';
                    break;
                }
                if (currentX > x + 5) break;
            }
        } else if (x < this.viewport.headerWidth && y > this.viewport.headerHeight) {
            let currentY = this.viewport.headerHeight - this.viewport.scrollY;
            for (let r = 0; r < this.store.getRowCount(); r++) {
                currentY += this.store.getRowHeight(r);
                if (Math.abs(y - currentY) < 5) {
                    cursor = 'row-resize';
                    break;
                }
                if (currentY > y + 5) break;
            }
        } else if (x > this.viewport.headerWidth && y > this.viewport.headerHeight) {
            cursor = 'cell';
        }

        this.canvas.style.cursor = cursor;

        if (this.dragMode === 'col') {
            const cellPos = this.viewport.getCellAt(x, this.viewport.headerHeight + 5);
            if (cellPos) {
                this.selection.updateSelection(this.store.getRowCount() - 1, cellPos.col);
                this.updateUI();
            }
        } else if (this.dragMode === 'row') {
            const cellPos = this.viewport.getCellAt(this.viewport.headerWidth + 5, y);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, this.store.getColumnCount() - 1);
                this.updateUI();
            }
        } else if (this.dragMode === 'cell') {
            const cellPos = this.viewport.getCellAt(x, y);
            if (cellPos) {
                this.selection.updateSelection(cellPos.row, cellPos.col);
                this.updateUI();
            }
        }
    }

    private handleMouseUp() {
        if (this.resizeMode === 'col') {
            const finalSize = this.store.getColumnWidth(this.resizeIndex);
            // Revert to start and use command for undo/redo
            this.store.setColumnWidth(this.resizeIndex, this.resizeStartSize);
            const cmd = new ResizeColumnCommand(this.store, this.resizeIndex, this.resizeStartSize, finalSize);
            this.commands.execute(cmd);
            
            this.resizeMode = null;
            this.updateUI();
        } else if (this.resizeMode === 'row') {
            const finalSize = this.store.getRowHeight(this.resizeIndex);
            this.store.setRowHeight(this.resizeIndex, this.resizeStartSize);
            const cmd = new ResizeRowCommand(this.store, this.resizeIndex, this.resizeStartSize, finalSize);
            this.commands.execute(cmd);
            
            this.resizeMode = null;
            this.updateUI();
        }

        if (this.dragMode) {
            this.dragMode = null;
            this.selection.endSelection();
        }
    }

    private handleDoubleClick(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cellPos = this.viewport.getCellAt(x, y);
        
        if (cellPos) {
            this.selection.setActiveCell(cellPos.row, cellPos.col);
            this.updateUI();
            this.editor.beginEdit(cellPos.row, cellPos.col);
        }
    }
}
