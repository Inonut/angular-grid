import {Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Optional, Output, Renderer2} from '@angular/core';
import {Subject} from 'rxjs';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';
import {takeUntil} from 'rxjs/operators';
import {IsxColumnResizeDirective} from './isx-column-resize.directive';
import {MatColumnDef} from '@angular/material';
import {IsxColumnResizeCellDirective} from './isx-column-resize-cell.directive';
import {HammerGestureConfig} from '@angular/platform-browser';

@Directive({
  selector: `[isx-column-resize-header]`,
  exportAs: 'isxColumnResizeHeader',
})
export class IsxColumnResizeHeaderDirective extends IsxColumnResizeCellDirective implements OnInit, OnDestroy {
  ngOnInit(): void {
    super.ngOnInit();

    let resizeEl = this.renderer.createElement("div");
    this.renderer.addClass(resizeEl, "resize-column-icon");
    this.renderer.appendChild(this.el.nativeElement, resizeEl);

    this.ngZone.runOutsideAngular(() => {
      let hammerEl = new HammerGestureConfig().buildHammer(resizeEl);
      let initsize = 0;
      hammerEl.on("panstart", (event) => initsize = this.el.nativeElement.clientWidth);
      hammerEl.on("panleft", (event) => this.isxColumnResizeDirective.resizeStream.next({size: initsize + event.deltaX, name: this.matColumnDef.name}));
      hammerEl.on("panright", (event) => this.isxColumnResizeDirective.resizeStream.next({size: initsize + event.deltaX, name: this.matColumnDef.name}));
      hammerEl.on("panend", (event) => this.isxColumnResizeDirective.endResizeStream.next({size: initsize + event.deltaX, name: this.matColumnDef.name}));
    });
  }
}
