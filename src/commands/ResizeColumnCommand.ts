import { ICommand } from './ICommand';
import { IGridDataStore } from '../store/IGridDataStore';

export class ResizeColumnCommand implements ICommand {
    constructor(
        private store: IGridDataStore,
        private col: number,
        private oldWidth: number,
        private newWidth: number
    ) {}

    execute(): void {
        this.store.setColumnWidth(this.col, this.newWidth);
    }

    undo(): void {
        this.store.setColumnWidth(this.col, this.oldWidth);
    }
}
