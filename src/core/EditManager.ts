import { IGridDataStore } from '../store/IGridDataStore';
import { ViewportManager } from '../core/ViewportManager';

export class EditManager {
    private inputElement: HTMLInputElement;
    private isEditing: boolean = false;
    private editRow: number = -1;
    private editCol: number = -1;

    constructor(
        private store: IGridDataStore,
        private viewport: ViewportManager,
        private onCommit: (row: number, col: number, value: string) => void,
        private onCancel: () => void
    ) {
        this.inputElement = document.getElementById('cellEditor') as HTMLInputElement;
        
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.commit();
            } else if (e.key === 'Escape') {
                this.cancel();
            }
        });
        
        this.inputElement.addEventListener('blur', () => {
            if (this.isEditing) {
                this.commit();
            }
        });
    }

    public beginEdit(row: number, col: number) {
        this.isEditing = true;
        this.editRow = row;
        this.editCol = col;
        
        const cell = this.store.getCell(row, col);
        this.inputElement.value = cell ? cell.rawValue : '';
        
        this.positionEditor(row, col);
        
        this.inputElement.classList.remove('hidden');
        this.inputElement.focus();
    }

    private positionEditor(row: number, col: number) {
        // Calculate position based on scroll and row/col
        let x = this.viewport.headerWidth - this.viewport.scrollX;
        for (let c = 0; c < col; c++) x += this.store.getColumnWidth(c);
        
        let y = this.viewport.headerHeight - this.viewport.scrollY;
        for (let r = 0; r < row; r++) y += this.store.getRowHeight(r);
        
        const w = this.store.getColumnWidth(col);
        const h = this.store.getRowHeight(row);
        
        const canvas = document.getElementById('gridCanvas');
        const wrapper = document.getElementById('gridWrapper');
        if (canvas && wrapper) {
            const canvasRect = canvas.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            x += (canvasRect.left - wrapperRect.left);
            y += (canvasRect.top - wrapperRect.top);
        }
        
        this.inputElement.style.left = `${x}px`;
        this.inputElement.style.top = `${y}px`;
        this.inputElement.style.width = `${w}px`;
        this.inputElement.style.height = `${h}px`;
    }

    public updatePositionIfEditing() {
        if (this.isEditing) {
            this.positionEditor(this.editRow, this.editCol);
        }
    }

    private commit() {
        if (!this.isEditing) return;
        const value = this.inputElement.value;
        const r = this.editRow;
        const c = this.editCol;
        
        this.hide();
        this.onCommit(r, c, value);
    }

    private cancel() {
        if (!this.isEditing) return;
        this.hide();
        this.onCancel();
    }

    private hide() {
        this.isEditing = false;
        this.editRow = -1;
        this.editCol = -1;
        this.inputElement.classList.add('hidden');
    }
}
