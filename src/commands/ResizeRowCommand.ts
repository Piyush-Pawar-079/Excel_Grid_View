import { ICommand } from './ICommand';
import { IGridDataStore } from '../store/IGridDataStore';

export class ResizeRowCommand implements ICommand {
    constructor(
        private store: IGridDataStore,
        private row: number,
        private oldHeight: number,
        private newHeight: number
    ) {}

    execute(): void {
        this.store.setRowHeight(this.row, this.newHeight);
    }

    undo(): void {
        this.store.setRowHeight(this.row, this.oldHeight);
    }
}
