import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';

export class CursorAction
implements IGridPointerAction {

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            grid.resizeMode ||
            grid.dragMode
        ) {
            return false;
        }

        const rect =
            grid.canvas.getBoundingClientRect();

        const x =
            e.clientX - rect.left;

        const y =
            e.clientY - rect.top;

        let cursor = 'default';

        if (
            y < grid.viewport.headerHeight &&
            x > grid.viewport.headerWidth
        ) {

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

                    cursor = 'col-resize';
                    break;
                }

                if (
                    currentX > x + 5
                ) {
                    break;
                }
            }
        }
        else if (
            x < grid.viewport.headerWidth &&
            y > grid.viewport.headerHeight
        ) {

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

                    cursor = 'row-resize';
                    break;
                }

                if (
                    currentY > y + 5
                ) {
                    break;
                }
            }
        }
        else if (
            x > grid.viewport.headerWidth &&
            y > grid.viewport.headerHeight
        ) {

            cursor = 'cell';
        }

        grid.canvas.style.cursor =
            cursor;

        return false;
    }
}