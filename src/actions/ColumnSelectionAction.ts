import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';

export class ColumnSelectionAction
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
            y >= grid.viewport.headerHeight ||
            x <= grid.viewport.headerWidth
        ) {
            return false;
        }

        // if (grid.resizeMode) {
        //     return false;
        // }

        const cellPos =
            grid.viewport.getCellAt(
                x,
                grid.viewport.headerHeight + 5
            );

        if (!cellPos) {
            return false;
        }

        grid.selection.beginSelection(
            0,
            cellPos.col
        );

        grid.selection.updateSelection(
            grid.store.getRowCount() - 1,
            cellPos.col
        );

        // grid.dragMode = 'col';
        this.active = true;

        grid.updateUI();

        return true;
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.dragMode !== 'col'
            !this.active
        ) {
            return false;
        }

        const rect =
            grid.canvas.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const cellPos =
            grid.viewport.getCellAt(
                x,
                grid.viewport.headerHeight + 5
            );

        if (!cellPos) {
            return true;
        }

        grid.selection.updateSelection(
            grid.store.getRowCount() - 1,
            cellPos.col
        );

        grid.updateUI();

        return true;
    }

    public handlePointerUp(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.dragMode !== 'col'
            !this.active
        ) {
            return false;
        }

        // grid.dragMode = null;

        grid.selection.endSelection();
        this.active = false;
        return true;
    }
}