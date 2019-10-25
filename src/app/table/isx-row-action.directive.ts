import {
  AfterContentInit,
  ComponentFactoryResolver,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {CdkPortal, CdkPortalOutlet} from '@angular/cdk/portal';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: `[isx-row-action]`,
  exportAs: 'isxRowAction',
})
export class IsxRowActionDirective implements AfterContentInit, OnDestroy {
  private unsubscribe = new Subject();

  @ContentChild(CdkPortal, {static: true}) cdkPortal: CdkPortal;
  @Input() allowMouseFollow = true;
  @Input() leftOffset = 0;

  constructor(private _viewContainerRef: ViewContainerRef,
              private ngZone: NgZone,
              private el: ElementRef,
              private renderer: Renderer2,
              private componentFactoryResolver: ComponentFactoryResolver,) {
  }


  ngAfterContentInit(): void {
    let portal = new CdkPortalOutlet(this.componentFactoryResolver, this._viewContainerRef);
    let viewRef = portal.attachTemplatePortal(this.cdkPortal);
    this.renderer.appendChild(this.el.nativeElement, viewRef.rootNodes[0]);

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.el.nativeElement, 'mouseenter')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((event: MouseEvent) => {
          if (this.allowMouseFollow) {
            let offsetX = 0;
            if(event.clientX + viewRef.rootNodes[0].clientWidth > screen.availWidth) {
              offsetX = event.layerX - viewRef.rootNodes[0].clientWidth;
            } else {
              offsetX = event.layerX;
            }
            this.el.nativeElement.style.setProperty('--row-actions-translate-x', `${offsetX}px`);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
