import {Directive, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {IsxColumnDragCellDirective} from './isx-column-drag-cell.directive';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: `[isxColumnDrag]`,
  exportAs: 'isxColumnDrag',
})
export class IsxColumnDragDirective implements OnInit, OnDestroy {
  private unsubscribe = new Subject();
  leftDragStream = new Subject();
  rightDragStream = new Subject();
  dropStream = new Subject();

  private columnsCache: {[name: string]: Array<IsxColumnDragCellDirective>} = {};
  private newOrder = [];
  private added = 0;

  @Input()
  set isxColumnDrag(val: string[]) {
    // @ts-ignore
    val.push = (e) => {
      Array.prototype.push.call(val, e);
      this.newOrder = val.slice();
    };

    // @ts-ignore
    val.splice = (e) => {
      Array.prototype.splice.call(val, e);
      this.newOrder = val.slice();
    };

    // @ts-ignore
    val.pop = (e) => {
      Array.prototype.pop.call(val, e);
      this.newOrder = val.slice();
    };

    this.newOrder = val.slice();
  }

  @Output() drop = new EventEmitter();

  constructor(private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.leftDragStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {
          if(this.newOrder.indexOf(name) != 0) {
            let colName = this.newOrder[this.newOrder.indexOf(name) - 1];

            if(this.columnsCache[colName] && -event.deltaX > this.processColumnWidth(colName) / 2 + this.added) {
              this.columnsCache[colName].forEach(directive => directive.moveTo(this.processColumnWidth(name), true));
              this.swap(this.newOrder.indexOf(name), this.newOrder.indexOf(name) - 1);
              this.added += this.processColumnWidth(colName);
            }
          }
        });

      this.rightDragStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {
          if(this.newOrder.indexOf(name) != this.newOrder.length - 1) {
            let colName = this.newOrder[this.newOrder.indexOf(name) + 1];

            if(this.columnsCache[colName] && event.deltaX > this.processColumnWidth(colName) / 2 - this.added) {
              this.columnsCache[colName].forEach(directive => directive.moveTo(-this.processColumnWidth(name), true));
              this.swap(this.newOrder.indexOf(name), this.newOrder.indexOf(name) + 1);
              this.added -= this.processColumnWidth(colName);
            }
          }
        });

      this.dropStream
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(({event, name}) => {

          this.columnsCache[name].forEach(directive => directive.moveTo(-this.added));
          this.added = 0;

          this.ngZone.run(() => setTimeout(() => this.drop.emit(this.newOrder), 200));
        });
    });
  }

  private processColumnWidth(name: string) {
    if(name == null || this.columnsCache[name][0] == null) {
      return null;
    }
    return this.columnsCache[name][0].el.nativeElement.clientWidth;
  }

  private swap(index1, index2) {
    [this.newOrder[index1], this.newOrder[index2]] = [this.newOrder[index2], this.newOrder[index1]];
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  add(directive: IsxColumnDragCellDirective) {
    this.columnsCache[directive.matColumnDef.name] = this.columnsCache[directive.matColumnDef.name] || [];
    this.columnsCache[directive.matColumnDef.name].push(directive);
  }

  remove(directive: IsxColumnDragCellDirective) {
    this.columnsCache[directive.matColumnDef.name] = this.columnsCache[directive.matColumnDef.name] || [];
    this.columnsCache[directive.matColumnDef.name].splice(this.columnsCache[directive.matColumnDef.name].indexOf(directive), 1);

    if(this.columnsCache[directive.matColumnDef.name].length == 0) {
      delete this.columnsCache[directive.matColumnDef.name];
    }
  }
}
