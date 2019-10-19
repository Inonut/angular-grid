import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AppService} from './app.service';
import {takeUntil} from 'rxjs/operators';
import {combineLatest, Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';
import {TableVirtualScrollStrategy} from './table/table-vs-strategy';
import {VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: VIRTUAL_SCROLL_STRATEGY,
    useClass: TableVirtualScrollStrategy,
  }],
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  dataSource = new MatTableDataSource<PeriodicElement>();
  scrolledDataSource = new MatTableDataSource<PeriodicElement>();

  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  static BUFFER_SIZE = 3;
  rowHeight = 32;
  headerHeight = 32;
  gridHeight = 400;

  constructor(private appService: AppService,
              @Inject(VIRTUAL_SCROLL_STRATEGY) private readonly scrollStrategy: TableVirtualScrollStrategy) {}

  ngOnInit(): void {

    this.appService.fetchData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => this.dataSource.data = data);


    const range = Math.ceil(this.gridHeight / this.rowHeight) + AppComponent.BUFFER_SIZE;
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);

    combineLatest([this.dataSource.connect(), this.scrollStrategy.scrolledIndexChange])
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((value: any) => {

        // Determine the start and end rendered range
        const start = Math.max(0, value[1] - AppComponent.BUFFER_SIZE);
        const end = Math.min(value[0].length, value[1] + range);

        // Update the datasource for the rendered range of data
        // return value[0].slice(start, end);
        this.scrolledDataSource.data = value[0].slice(start, end);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  addColumn() {
    const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
    this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
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

}


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
