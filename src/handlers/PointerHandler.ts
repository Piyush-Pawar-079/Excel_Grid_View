import { Grid } from '../core/Grid';
import { IGridPointerAction } from '../actions/IGridPointerAction';

export class PointerHandler {

    private activeHandler: IGridPointerAction | null = null;

    constructor(
        private actions: IGridPointerAction[]
    ) {}

    public handlePointerDown(
        e: PointerEvent,
        grid: Grid
    ) {

        for (const action of this.actions) {

            if (
                action.handlePointerDown?.(
                    e,
                    grid
                )
            ) { 
                this.activeHandler = action;
                return;
            }
        }
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ) {

        if (this.activeHandler != null) {
            this.activeHandler.handlePointerMove!(e, grid);
        }

        for (const action of this.actions) {

            if (
                action.getCursor?.(e, grid)
            ) {
                const cursor = action.getCursor?.(e, grid);
                if (cursor) {
                    grid.canvas.style.cursor = cursor;
                    return
                }
            }
        }
    }

    public handlePointerUp(
        e: PointerEvent,
        grid: Grid
    ) {

        if (this.activeHandler != null) {
            this.activeHandler.handlePointerUp!(e, grid);
        }

        for (const action of this.actions) {

            if (
                action.getCursor?.(e, grid)
            ) {
                const cursor = action.getCursor?.(e, grid);
                if(cursor)
                    grid.canvas.style.cursor = cursor;
                    return;
            }
        }
    }

    public onMouseLeave(grid: Grid): void{
            grid.canvas.style.cursor = "default";
    }
}