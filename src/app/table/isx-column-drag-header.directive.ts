import {Directive, OnDestroy, OnInit} from '@angular/core';
import {HammerGestureConfig} from '@angular/platform-browser';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';

@Directive({
  selector: `[isx-column-drag-header]`,
  exportAs: 'isxColumnDragHeader',
})
export class IsxColumnDragHeaderDirective extends IsxColumnDragCellDirective implements OnInit, OnDestroy {

  ngOnInit(): void {
    super.ngOnInit();
    this.ngZone.runOutsideAngular(() => {
      let hammerEl = new HammerGestureConfig().buildHammer(this.el.nativeElement);
      hammerEl.on("panleft", (event) => this.isxColumnDragDirective.leftDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panright", (event) => this.isxColumnDragDirective.rightDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panend", (event) => this.isxColumnDragDirective.dropStream.next({event, name: this.matColumnDef.name}));
    });
  }
}
