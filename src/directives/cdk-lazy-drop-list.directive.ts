import { Input, Directive, QueryList } from '@angular/core';
import { CdkDropList, CdkDrag, CDK_DROP_LIST_CONTAINER } from '@angular/cdk/drag-drop';

@Directive({
  selector: '[cdkLazyDropList]',
  exportAs: 'cdkLazyDropList',
  providers: [
    { provide: CDK_DROP_LIST_CONTAINER, useExisting: CdkLazyDropList },
  ],
  host: { // tslint:disable-line:use-host-property-decorator
    'class': 'cdk-drop-list',
    '[id]': 'id',
    '[class.cdk-drop-list-dragging]': '_dragging'
  }
})
export class CdkLazyDropList<T = any> extends CdkDropList<T> {
  /**
   * Selector that will be used to determine the direct container element, starting from
   * the `cdkDropList` element and going down the DOM. Passing an alternate direct container element
   * is useful when the `cdkDropList` is not the direct parent (i.e. ancestor but not father)
   * of the draggable elements.
   */
  // tslint:disable-next-line:no-input-rename
  @Input('cdkDropListDirectContainerElement') directContainerElement: string;

  _draggables: QueryList<CdkDrag>;

  private _draggablesSet = new Set<CdkDrag>();

  // This is a workaround for https://github.com/angular/material2/pull/14153
  // Working around the missing capability for selecting a container element that is not the drop container host.
  // The entire enter() overriding method can be removed if PR accepted, along with `directContainerElement`
  enter(item: CdkDrag, pointerX: number, pointerY: number): void {
    super.enter(item, pointerX, pointerY);
    if (this.directContainerElement) {
      const placeholder = item.getPlaceholderElement();
      if (this.element.nativeElement.lastChild === placeholder) {
        const element = this.element.nativeElement.querySelector(this.directContainerElement);
        if (element) {
          element.appendChild(item.getPlaceholderElement());
        }
      }
    }
  }

  addDrag(drag: CdkDrag): void {
    this._draggablesSet.add(drag);
    this._draggables.reset(Array.from(this._draggablesSet.values()));
  }

  removeDrag(drag: CdkDrag): boolean {
    const result = this._draggablesSet.delete(drag);
    if (result) {
      this._draggables.reset(Array.from(this._draggablesSet.values()));
    }
    return result;
  }

}