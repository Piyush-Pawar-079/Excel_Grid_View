import { ICommand } from './ICommand';
import { IGridDataStore } from '../store/IGridDataStore';
import { CellModel } from '../models/CellModel';

export class EditCellCommand implements ICommand {
    private previousCell: CellModel | null;

    constructor(
        private store: IGridDataStore,
        private row: number,
        private col: number,
        private newCell: CellModel,
    ) {
        // deep copy if needed, or assume CellModel is replaced entirely
        this.previousCell = store.getCell(row, col);
    }

    execute(): void {
        this.store.setCell(this.row, this.col, this.newCell);
        // Dependencies need to be recalculated. This is a basic implementation.
        // The actual evaluation might be triggered by the Grid coordinator.
    }

    undo(): void {
        if (this.previousCell) {
            this.store.setCell(this.row, this.col, this.previousCell);
        } else {
            // Revert to empty
            this.store.setCell(this.row, this.col, {
                row: this.row,
                col: this.col,
                rawValue: '',
                computedValue: null,
                hasError: false
            });
        }
    }
}
