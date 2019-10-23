import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AppService} from './app.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatSort, MatTableDataSource} from '@angular/material';
import {TableSelectionModel} from './table/table-selection.model';
import {IsxVirtualScrollViewportComponent} from './table/isx-virtual-scroll-viewport.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  dataSource = new MatTableDataSource<PeriodicElement>();

  selectionModel = new TableSelectionModel<PeriodicElement>(true).withData(this.dataSource);
  toggleFilter = false;

  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  @ViewChild(MatSort, {static: true}) matSort: MatSort;
  @ViewChild('viewScroll', {static: true}) viewScroll: IsxVirtualScrollViewportComponent<PeriodicElement>;

  constructor(private appService: AppService,
              private el: ElementRef,
              private ngZone: NgZone,
              private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dataSource.sort = this.matSort;

    this.appService.fetchData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => this.dataSource.data = data);

    /*this.selectionModel.changed
      .pipe(
        takeUntil(this.unsubscribe),
        debounceTime(1)
      )
      .subscribe((data) => {
        this.viewScroll.viewPort.scrollToIndex(this.dataSource.data.indexOf(data.added[0]) - 1);
        console.log(this.viewScroll.viewPort.elementRef.nativeElement, this.ngZone.isStable);
        this.viewScroll.viewPort.elementRef.nativeElement.scrollTop = 1000;
      });*/

    new Array(16).fill(0).forEach(() => this.addColumn());
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngAfterContentChecked() {
    /*if(this.selectionModel.selected && this.selectionModel.selected.length) {
      this.viewScroll.viewPort.scrollToIndex(this.dataSource.data.indexOf(this.selectionModel.selected[0]) - 1);
    }*/
  }

  addColumn() {
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    const newColumn = this.displayedColumns[randomColumn] + " ##### " + uuidv4();
    this.dataSource.data.forEach(el => el[newColumn] = el[this.displayedColumns[randomColumn]]);
    this.columnsToDisplay.push(newColumn);
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }

  fetchNextPage(index: number) {
    if(index >= this.dataSource.data.length - 100) {
      this.appService.fetchData()
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((data) => this.dataSource.data = this.dataSource.data.concat(data));
    }
  }

  format(column: string) {
    return column.split("#####")[0];
  }

  parentHeader(columnName: string) {
    return columnName.replace('filter_', '');
  }

  console($event: any) {
    console.log($event)
  }

  get filteredColumnsToDisplay() {
    return this.columnsToDisplay.map(el => 'filter_' + el);
  }

  selectNextElement() {
    this.selectionModel.selectNextElement();
    setTimeout(() => {
      // this.viewScroll.viewPort.scrollToIndex(this.dataSource.data.indexOf(data.added[0]) - 1);
    });
  }
}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
