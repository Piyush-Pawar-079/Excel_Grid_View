import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';

export class CellSelectionAction
implements IGridPointerAction {

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

        grid.dragMode = 'cell';

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
            grid.dragMode !== 'cell'
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
        grid: Grid
    ): boolean {

        if (
            grid.dragMode !== 'cell'
        ) {
            return false;
        }

        grid.dragMode = null;

        grid.selection.endSelection();

        return true;
    }
}