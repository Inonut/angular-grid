import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {DemoMaterialModule} from './material.module';
import { TableComponent } from './table/table.component';
import {IsxColumnDragDirective} from './table/isx-column-drag.directive';
import {IsxColumnDragHeaderDirective} from './table/isx-column-drag-header.directive';
import {IsxColumnDragCellDirective} from './table/isx-column-drag-cell.directive';
import {IsxColumnResizeDirective} from './table/isx-column-resize.directive';
import {IsxColumnResizeCellDirective} from './table/isx-column-resize-cell.directive';
import {IsxColumnResizeHeaderDirective} from './table/isx-column-resize-header.directive';
import {IsxVirtualForDirective} from './table/isx-virtual-for.directive';
import {IsxVirtualScrollViewportContainerComponent} from './table/isx-virtual-scroll-viewport-container.component';

@NgModule({
  declarations: [
    AppComponent,

    TableComponent,

    IsxVirtualScrollViewportContainerComponent,

    IsxColumnDragDirective,
    IsxColumnDragHeaderDirective,
    IsxColumnDragCellDirective,

    IsxColumnResizeDirective,
    IsxColumnResizeHeaderDirective,
    IsxColumnResizeCellDirective,

    IsxVirtualForDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DemoMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
