import {AfterViewChecked, Directive, ElementRef, HostBinding, NgZone, OnDestroy, OnInit, Optional, Renderer2} from '@angular/core';
import {fromEvent, merge, Subject} from 'rxjs';
import {IsxColumnDragDirective} from './isx-column-drag.directive';
import {MatColumnDef} from '@angular/material';
import {HammerGestureConfig} from '@angular/platform-browser';
import {filter, takeUntil} from 'rxjs/operators';

@Directive({
  selector: `[isx-column-drag-cell]`,
  exportAs: 'isxColumnDragCell',
})
export class IsxColumnDragCellDirective implements OnInit, OnDestroy {
  protected unsubscribe = new Subject();

  constructor(@Optional() protected isxColumnDragDirective: IsxColumnDragDirective,
              @Optional() public matColumnDef: MatColumnDef,
              public el: ElementRef,
              public renderer: Renderer2,
              protected ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.isxColumnDragDirective.add(this);

    this.ngZone.runOutsideAngular(() => {
      merge(this.isxColumnDragDirective.leftDragStream, this.isxColumnDragDirective.rightDragStream)
        .pipe(
          takeUntil(this.unsubscribe),
          filter(({name, event}) => name == this.matColumnDef.name)
        )
        .subscribe(({event}) => {
          this.moveTo(event.deltaX);
        });
    });
  }

  ngOnDestroy(): void {
    this.isxColumnDragDirective.remove(this);
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  moveTo(distance: number, fromCurrentPos = false) {
    let origin = 0;
    if(fromCurrentPos) {
      origin = parseInt(this.el.nativeElement.style.transform.replace( 'translateX(', '')) || 0;
    }

    this.renderer.setStyle(this.el.nativeElement, "transform", `translateX(${origin + distance}px)`);
  }

}
