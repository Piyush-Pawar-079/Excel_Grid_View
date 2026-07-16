import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';
import { ResizeRowCommand } from '../commands/ResizeRowCommand';

export class RowResizeAction
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

        if (
            x >= grid.viewport.headerWidth ||
            y <= grid.viewport.headerHeight
        ) {
            return false;
        }

        let currentY =
            grid.viewport.headerHeight -
            grid.viewport.scrollY;

        for (
            let r = 0;
            r < grid.store.getRowCount();
            r++
        ) {

            currentY +=
                grid.store.getRowHeight(r);

            if (
                Math.abs(y - currentY) < 5
            ) {

                grid.resizeMode = 'row';
                grid.resizeIndex = r;
                grid.resizeStartPos = e.clientY;
                grid.resizeStartSize =
                    grid.store.getRowHeight(r);

                return true;
            }

            if (currentY > y + 5) {
                break;
            }
        }

        return false;
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            grid.resizeMode !== 'row'
        ) {
            return false;
        }

        grid.canvas.style.cursor =
            'row-resize';

        const diff =
            e.clientY -
            grid.resizeStartPos;

        const newSize =
            Math.max(
                24,
                grid.resizeStartSize + diff
            );

        grid.store.setRowHeight(
            grid.resizeIndex,
            newSize
        );

        grid.updateScrollSize();
        grid.updateUI();

        return true;
    }

    public handlePointerUp(
        grid: Grid
    ): boolean {

        if (
            grid.resizeMode !== 'row'
        ) {
            return false;
        }

        const finalSize =
            grid.store.getRowHeight(
                grid.resizeIndex
            );

        grid.store.setRowHeight(
            grid.resizeIndex,
            grid.resizeStartSize
        );

        const cmd =
            new ResizeRowCommand(
                grid.store,
                grid.resizeIndex,
                grid.resizeStartSize,
                finalSize
            );

        grid.commands.execute(cmd);

        grid.resizeMode = null;

        grid.updateUI();

        return true;
    }
}