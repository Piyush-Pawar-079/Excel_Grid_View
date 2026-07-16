import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';
import { ResizeColumnCommand } from '../commands/ResizeColumnCommand';

export class ColumnResizeAction
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
            y >= grid.viewport.headerHeight ||
            x <= grid.viewport.headerWidth
        ) {
            return false;
        }

        let currentX =
            grid.viewport.headerWidth -
            grid.viewport.scrollX;

        for (
            let c = 0;
            c < grid.store.getColumnCount();
            c++
        ) {

            currentX +=
                grid.store.getColumnWidth(c);

            if (
                Math.abs(x - currentX) < 5
            ) {

                grid.resizeMode = 'col';
                grid.resizeIndex = c;
                grid.resizeStartPos = e.clientX;
                grid.resizeStartSize =
                    grid.store.getColumnWidth(c);

                return true;
            }
        }

        return false;
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            grid.resizeMode !== 'col'
        ) {
            return false;
        }

        grid.canvas.style.cursor =
            'col-resize';

        const diff =
            e.clientX -
            grid.resizeStartPos;

        const newSize =
            Math.max(
                40,
                grid.resizeStartSize + diff
            );

        grid.store.setColumnWidth(
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
            grid.resizeMode !== 'col'
        ) {
            return false;
        }

        const finalSize =
            grid.store.getColumnWidth(
                grid.resizeIndex
            );

        grid.store.setColumnWidth(
            grid.resizeIndex,
            grid.resizeStartSize
        );

        grid.commands.execute(
            new ResizeColumnCommand(
                grid.store,
                grid.resizeIndex,
                grid.resizeStartSize,
                finalSize
            )
        );

        grid.resizeMode = null;

        grid.updateUI();

        return true;
    }
}