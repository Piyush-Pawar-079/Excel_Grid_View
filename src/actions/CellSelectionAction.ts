import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';

export class CellSelectionAction
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

        const cellPos =
            grid.viewport.getCellAt(
                x,
                y
            );

        if (!cellPos) {
            return false;
        }

        // grid.dragMode = 'cell';
        this.active = true;

        grid.selection.beginSelection(
            cellPos.row,
            cellPos.col
        );

        grid.updateUI();

        return true;
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.dragMode !== 'cell'
            !this.active 
        ) {
            return false;
        }

        const rect =
            grid.canvas.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        const cellPos =
            grid.viewport.getCellAt(
                x,
                y
            );

        if (!cellPos) {
            return true;
        }

        grid.selection.updateSelection(
            cellPos.row,
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
            // grid.dragMode !== 'cell'
            !this.active
        ) {
            return false;
        }

        // grid.dragMode = null;

        grid.selection.endSelection();
        this.active = false;
        return true;
    }

    getCursor(e: PointerEvent, grid: Grid): string | null {
        const { offsetX, offsetY } = e;
        const { headerWidth, headerHeight } = grid.viewport;
        if (offsetX >= headerWidth && offsetY >= headerHeight) {
            return "cell";
        }
        return null;
    }
}