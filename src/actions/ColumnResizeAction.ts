import { Grid } from '../core/Grid';
import { IGridPointerAction } from './IGridPointerAction';
import { ResizeColumnCommand } from '../commands/ResizeColumnCommand';

export class ColumnResizeAction
implements IGridPointerAction {

    private active = false;
    private col = -1;
    private startX = 0;
    private startWidth = 0;

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

                // grid.resizeMode = 'col';
                this.active = true;

                // grid.resizeIndex = c;
                this.col = c;

                // grid.resizeStartPos = e.clientX;
                this.startX = e.clientX;

                // grid.resizeStartSize = grid.store.getColumnWidth(c);
                this.startWidth = grid.store.getColumnWidth(c);

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
            // grid.resizeMode !== 'col'
            !this.active
        ) {
            return false;
        }

        grid.canvas.style.cursor =
            'col-resize';

        const diff =
            e.clientX -
            // grid.resizeStartPos;
            this.startX;

        const newSize =
            Math.max(
                40,
                // grid.resizeStartSize + diff
                this.startWidth + diff
            );

        grid.store.setColumnWidth(
            // grid.resizeIndex,
            this.col,
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
            // grid.resizeMode !== 'col'
            !this.active
        ) {
            return false;
        }

        const finalSize =
            grid.store.getColumnWidth(
                // grid.resizeIndex
                this.col
            );

        grid.store.setColumnWidth(
            // grid.resizeIndex,
            this.col,
            // grid.resizeStartSize
            this.startWidth
        );

        grid.commands.execute(
            new ResizeColumnCommand(
                grid.store,
                // grid.resizeIndex,
                this.col,
                // grid.resizeStartSize,
                this.startWidth,
                finalSize
            )
        );

        // grid.resizeMode = null;
        grid.updateUI();
        this.active = false;
        return true;
    }

    // getCursor(e: PointerEvent, grid: Grid): string | null {
    //     const { offsetX, offsetY } = e;
    //     if (offsetY < grid.viewport.headerHeight && offsetX >= grid.viewport.headerWidth) {
    //         // if (this.colResizeHandleAt(offsetX) >= 0) 
    //         if(this.col >= 0)
    //             return "col-resize";
    //     }
    //     return null;
    // }

}