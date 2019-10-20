import {Directive, ElementRef, NgZone, OnDestroy, OnInit, Optional, Renderer2} from '@angular/core';
import {merge, Subject} from 'rxjs';
import {IsxColumnDragDirective} from './isx-column-drag.directive';
import {MatColumnDef} from '@angular/material';
import {HammerGestureConfig} from '@angular/platform-browser';
import {filter, takeUntil} from 'rxjs/operators';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';

@Directive({
  selector: `[isx-column-drag-header]`,
  exportAs: 'isxColumnDragHeader',
})
export class IsxColumnDragHeaderDirective extends IsxColumnDragCellDirective implements OnInit, OnDestroy {

  ngOnInit(): void {
    super.ngOnInit();
    this.ngZone.runOutsideAngular(() => {
      this.renderer.setStyle(this.el.nativeElement, "user-select", `none`);

      let hammerEl = new HammerGestureConfig().buildHammer(this.el.nativeElement);
      hammerEl.on("panleft", (event) => this.isxColumnDragDirective.leftDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panright", (event) => this.isxColumnDragDirective.rightDragStream.next({event, name: this.matColumnDef.name}));
      hammerEl.on("panend", (event) => this.isxColumnDragDirective.dropStream.next({event, name: this.matColumnDef.name}));
    });
  }
}
