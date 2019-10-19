import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppService} from './app.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();

  dataSource = new MatTableDataSource<PeriodicElement>();

  displayedColumns: string[] = ['name', 'weight', 'symbol', 'position'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  @ViewChild(MatSort, {static: true}) matSort: MatSort;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.dataSource.sort = this.matSort;

    this.appService.fetchData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data) => this.dataSource.data = data);
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
