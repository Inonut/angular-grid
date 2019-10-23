import {Directive, EventEmitter, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: `[isxColumnResize]`,
  exportAs: 'isxColumnResize',
})
export class IsxColumnResizeDirective implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  resizeStream = new Subject();
  endResizeStream = new Subject();

  @Output() resize = new EventEmitter();

  constructor(private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.endResizeStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((data) => {
          this.resize.emit(data);
        });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
