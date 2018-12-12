import { Directive, AfterViewInit, OnDestroy, Input } from "@angular/core";
import { CdkLazyDropList } from "./cdk-lazy-drop-list.directive";
import { CdkDrag } from "@angular/cdk/drag-drop";
import { take } from 'rxjs/operators';

@Directive({
   selector: '[cdkLazyDrag]',
   exportAs: 'cdkLazyDrag',
   host: { // tslint:disable-line:use-host-property-decorator
     'class': 'cdk-drag',
     '[class.cdk-drag-dragging]': '_hasStartedDragging && _isDragging()',
   },
 })
 export class CdkLazyDrag<T = any, Z extends CdkLazyDropList<T> = CdkLazyDropList<T>> extends CdkDrag<T> implements AfterViewInit, OnDestroy {
 
   @Input() get cdkDropList(): Z { return this.dropContainer as Z; }
   set cdkDropList(value: Z) {
     // TO SUPPORT `cdkDropList` via string input (ID) we need a reactive registry...
     if (this.cdkDropList) {
       this.cdkDropList.removeDrag(this);
     }
     this.dropContainer = value;
     if (value) {
       value.addDrag(this);
     }
   }
 
   // This is a workaround for https://github.com/angular/material2/pull/14158
   // Working around the issue of drop container is not the direct parent (father) of a drag item.
   // The entire ngAfterViewInit() overriding method can be removed if PR accepted.
   ngAfterViewInit(): void {
     this.started.subscribe( startedEvent => {
       if (this.dropContainer) {
         const element = this.getRootElement();
         const initialRootElementParent = element.parentNode as HTMLElement;
         if (initialRootElementParent !== this.dropContainer.element.nativeElement) {
           this.ended.pipe(take(1)).subscribe( endedEvent => initialRootElementParent.appendChild(element) );
         }
       }
     });
 
     super.ngAfterViewInit();
   }
 
   ngOnDestroy(): void {
     if (this.cdkDropList) {
       this.cdkDropList.removeDrag(this);
     }
     super.ngOnDestroy();
   }
 }