import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';
import { ResizeRowCommand } from '../commands/ResizeRowCommand';

export class RowResizeAction
implements IGridPointerAction {

    private active = false;
    private row = -1;
    private startY = 0;
    private startHeight = 0;

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

                // grid.resizeMode = 'row';
                this.active = true;

                // grid.resizeIndex = r;
                this.row = r;

                // grid.resizeStartPos = e.clientY;
                this.startY = e.clientY;

                // grid.resizeStartSize =
                this.startHeight =
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
            // grid.resizeMode !== 'row'
            !this.active
        ) {
            return false;
        }

        grid.canvas.style.cursor =
            'row-resize';

        const diff =
            e.clientY -
            // grid.resizeStartPos;
            this.startY

        const newSize =
            Math.max(
                24,
                // grid.resizeStartSize + diff
                this.startHeight + diff
            );

        grid.store.setRowHeight(
            // grid.resizeIndex,
            this.row,
            newSize
        );

        grid.updateScrollSize();
        grid.updateUI();

        return true;
    }

    public handlePointerUp(
        e: PointerEvent,
        grid: Grid
    ): boolean {

        if (
            // grid.resizeMode !== 'row'
            !this.active
        ) {
            return false;
        }

        const finalSize =
            grid.store.getRowHeight(
                // grid.resizeIndex
                this.row
            );

        grid.store.setRowHeight(
            // grid.resizeIndex,
            this.row,
            // grid.resizeStartSize
            this.startHeight
        );

        const cmd =
            new ResizeRowCommand(
                grid.store,
                // grid.resizeIndex,
                this.row,
                // grid.resizeStartSize,
                this.startHeight,
                finalSize
            );

        grid.commands.execute(cmd);

        // grid.resizeMode = null;
        this.active = false;

        grid.updateUI();

        return true;
    }

    // getCursor(e: PointerEvent, grid: Grid): string | null {
    //     const { offsetX, offsetY } = e;
    //     if (offsetY >= grid.viewport.headerHeight && offsetX < grid.viewport.headerWidth) {
    //         // if (this.colResizeHandleAt(offsetX) >= 0) 
    //         if(this.row >= 0)
    //             return "row-resize";
    //     }
    //     return null;
    // }

}