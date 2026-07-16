import { Grid } from '../core/Grid';
import { IGridPointerAction } from '../actions/IGridPointerAction';

export class PointerHandler {

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
                return;
            }
        }
    }

    public handlePointerMove(
        e: PointerEvent,
        grid: Grid
    ) {

        for (const action of this.actions) {

            if (
                action.handlePointerMove?.(
                    e,
                    grid
                )
            ) {
                return;
            }
        }
    }

    public handlePointerUp(
        grid: Grid
    ) {

        for (const action of this.actions) {

            if (
                action.handlePointerUp?.(
                    grid
                )
            ) {
                return;
            }
        }
    }
}