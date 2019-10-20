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

    let dragContainer = this.renderer.createElement("div");
    this.renderer.addClass(dragContainer, "drag-column-container");
    this.renderer.appendChild(this.el.nativeElement, dragContainer);
    this.renderer.appendChild(dragContainer, this.el.nativeElement.firstChild);

    this.ngZone.runOutsideAngular(() => {
      let hammerEl = new HammerGestureConfig().buildHammer(dragContainer);
      hammerEl.on("panleft", (event) => this.isxColumnDragDirective.leftDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panright", (event) => this.isxColumnDragDirective.rightDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panend", (event) => this.isxColumnDragDirective.dropStream.next({event, name: this.matColumnDef.name}));
    });
  }
}
