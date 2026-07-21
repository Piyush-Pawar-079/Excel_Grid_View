import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';

export class RowSelectionAction
implements IGridPointerAction {

    private active = false;

    public handlePointerDown(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        const rect =
            grid.canvas.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        if (
            x >= grid.viewport.headerWidth ||
            y <= grid.viewport.headerHeight
        ) {
            return false;
        }

        // if (grid.resizeMode) {
        //     return false;
        // }

        const cellPos =
            grid.viewport.getCellAt(
                grid.viewport.headerWidth + 5,
                y
            );

        if (!cellPos) {
            return false;
        }

        grid.selection.beginSelection(
            cellPos.row,
            0
        );

        grid.selection.updateSelection(
            cellPos.row,
            grid.store.getColumnCount() - 1
        );

        // grid.dragMode = 'row';
        this.active = true;

        grid.updateUI();

        return true;
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.dragMode !== 'row'
            !this.active
        ) {
            return false;
        }

        const rect =
            grid.canvas.getBoundingClientRect();

        const y =
            e.clientY - rect.top;

        const cellPos =
            grid.viewport.getCellAt(
                grid.viewport.headerWidth + 5,
                y
            );

        if (!cellPos) {
            return true;
        }

        grid.selection.updateSelection(
            cellPos.row,
            grid.store.getColumnCount() - 1
        );

        grid.updateUI();

        return true;
    }

    public handlePointerUp(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.dragMode !== 'row'
            !this.active
        ) {
            return false;
        }

        // grid.dragMode = null;
        this.active = false;

        grid.selection.endSelection();

        return true;
    }
}