import {Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Optional, Output, Renderer2} from '@angular/core';
import {Subject} from 'rxjs';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';
import {filter, takeUntil} from 'rxjs/operators';
import {IsxColumnDragDirective} from './isx-column-drag.directive';
import {MatColumnDef} from '@angular/material';
import {IsxColumnResizeDirective} from './isx-column-resize.directive';

@Directive({
  selector: `[isx-column-resize-cell]`,
  exportAs: 'isxColumnResizeCell',
})
export class IsxColumnResizeCellDirective implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  constructor(@Optional() protected isxColumnResizeDirective: IsxColumnResizeDirective,
              @Optional() public matColumnDef: MatColumnDef,
              public el: ElementRef,
              public renderer: Renderer2,
              protected ngZone: NgZone) {
  }

  ngOnInit(): void {

    this.isxColumnResizeDirective.resizeStream
      .pipe(
        takeUntil(this.unsubscribe),
        filter(({name, size}) => name == this.matColumnDef.name)
      )
      .subscribe(({size}) => {
        this.renderer.addClass(this.el.nativeElement, "isx-resize-column");
        this.resize(size);
      });

    this.isxColumnResizeDirective.endResizeStream
      .pipe(
        takeUntil(this.unsubscribe),
        filter(({name, event}) => name == this.matColumnDef.name)
      )
      .subscribe(({event}) => this.renderer.removeClass(this.el.nativeElement, "isx-resize-column"));
  }

  resize(size: number) {
    this.renderer.setStyle(this.el.nativeElement, 'width', `${size}px`);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
