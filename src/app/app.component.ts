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
