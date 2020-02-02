import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, 
  ElementRef, ViewChild, Input, Inject, ChangeDetectorRef, OnDestroy, forwardRef } from '@angular/core';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { filter, tap, pluck, map, distinctUntilChanged, takeUntil, min } from 'rxjs/internal/operators';
import { SliderEventObserverConfig, SliderValue } from './wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { sliderEvent, getElementOffset } from './wy-slider-helper';
import { inArray } from 'src/app/utils/array';
import { limitNumberInRange } from 'src/app/utils/number';
import { getPercent } from 'ng-zorro-antd';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // 视图封装模式
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => WySliderComponent),
    multi: true
  }]
})
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {
 
  private sliderDom: HTMLDivElement;
  @ViewChild('wySlider', { static: true }) private el: ElementRef;
  @Input() wyVertical = false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;
  @Input() bufferOffset: SliderValue = 0;

  private dragStart$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;
  private dragStart_: Subscription | null;
  private dragMove_: Subscription | null;
  private dragEnd_: Subscription | null;

  private isDragging = false;

  value: SliderValue = null;
  offset: SliderValue = null;

  constructor(
    @Inject(DOCUMENT) private doc: Document, // 引入angular依赖注入的document对象
    private cdr: ChangeDetectorRef
    ) { }

  ngOnInit() {
    this.sliderDom = this.el.nativeElement;
    this.createDraggingObservables();
    this.subscrbeDrag(['start']);
  }

  // 绑定事件
  private createDraggingObservables() {
   const orientField = this.wyVertical ? 'pageY' : 'pageX';
   const mouse: SliderEventObserverConfig = {
     start: 'mousedown',
     move: 'mousemove',
     end: 'mouseup',
     filter: (e: MouseEvent) => e instanceof MouseEvent,
     pluckKey: [orientField]
   };
   const touch: SliderEventObserverConfig = {
    start: 'touchdown',
    move: 'touchmove',
    end: 'touchend',
    filter: (e: TouchEvent) => e instanceof TouchEvent,
    pluckKey: ['touches', '0', orientField]
   };

   [mouse, touch].forEach(source => {
     const {start, move , end, filter: filterFuc, pluckKey } = source;
     source.startPlucked$ = fromEvent(this.sliderDom, start)
     .pipe(
        filter(filterFuc),
        tap(sliderEvent),
        pluck(...pluckKey),
        map((position: number) => this.findClosestValue(position))
     );
     // 若使用原生dom不利于服务端渲染
     source.end$ = fromEvent(this.doc, end);

     source.moveResolved$ = fromEvent(this.doc, move).pipe(
        filter(filterFuc),
        tap(sliderEvent),
        pluck(...pluckKey),
        distinctUntilChanged(), // 避免事件持续触发
        map((position: number) => this.findClosestValue(position)),
        takeUntil(source.end$)
     );
   });

   this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
   this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
   this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  private findClosestValue(position: number): number {
    // 获取滑块总长
   const sliderLenth = this.getSliderLength();
   // 滑块上（左）端点
   const sliderStart = this.getSliderStartPosition();
   // 滑块当前位置/总长
   const ratio = limitNumberInRange((position - sliderStart) / sliderLenth, 0 , 1);
   const rationTrue = this.wyVertical ? 1 - ratio : ratio;

   return rationTrue * (this.wyMax - this.wyMin) + this.wyMin;
  }

  private getSliderLength(): number {
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }

  private getSliderStartPosition(): number {
    const offset = getElementOffset(this.sliderDom);
    return this.wyVertical ? offset.top : offset.left;
  }

  

  private subscrbeDrag(envents: string[] = ['start', 'move', 'end']) {
     if (inArray(envents, 'start') && this.dragStart$ && !this.dragStart_) {
        this.dragStart_ = this.dragStart$.subscribe(this.onDragStart.bind(this));
     }
     if (inArray(envents, 'move') && this.dragMove$ && !this.dragMove_) {
      this.dragMove_ = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }
     if (inArray(envents, 'end') && this.dragEnd$ && !this.dragEnd_) {
      this.dragEnd_ = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }

  private unsubscrbeDrag(envents: string[] = ['start', 'move', 'end']) {
    if (inArray(envents, 'start') && this.dragStart_) {
       this.dragStart_.unsubscribe();
       this.dragStart_ = null;
    }
    if (inArray(envents, 'move') && this.dragMove_) {
       this.dragMove_.unsubscribe();
       this.dragMove_ = null;
   }
    if (inArray(envents, 'end') && this.dragEnd_) {
      this.dragEnd_.unsubscribe();
      this.dragEnd_ = null;
   }
 }

  private onDragStart(value: number) {
    this.toggleDragMoving(true);
    this.setValue(value);
    this.cdr.markForCheck();
  }
  private onDragMove(value: number) {
     if (this.isDragging) {
       this.setValue(value);
       this.cdr.markForCheck(); // 手动触发组件检测
     }
  }
  private onDragEnd(value: number) {
    this.toggleDragMoving(false);
    this.cdr.markForCheck();
  }

  private setValue(value: SliderValue, needCheck = false) {
    if (needCheck) {
      if (this.isDragging) { return; }
      this.value = this.formatValue(value);
      this.updateTrackAndHandles();
    } else if (!this.valuesEqual(this.value, value)) {
      this.value = value;
      this.updateTrackAndHandles();
      this.onValueChange(this.value);
    }
  }

  private formatValue(value: SliderValue): SliderValue {
    let res = value;
    if (this.assertValueValid(value)) {
      res = this.wyMin;
    } else {
      res = limitNumberInRange(value, this.wyMin, this.wyMax);
    }
    return res;
  }

  // 判断是否是NAN
  private assertValueValid(value: SliderValue): boolean {
    return isNaN(typeof value !== 'number' ? parseFloat(value) : value);
  }

  private valuesEqual(valA: SliderValue, valB: SliderValue): boolean {
    if (typeof valA !== typeof valB) {
        return false;
    }

    return valA === valB;
  }

  private updateTrackAndHandles() {
    this.offset = this.getValueToOffset(this.value);
    this.cdr.markForCheck();
  }

  private getValueToOffset(value: SliderValue): SliderValue {
    return getPercent(this.wyMin, this.wyMax, value);
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = true;
    if (movable) {
     this.subscrbeDrag(['move', 'end']);
    } else {
      // this.unsubscrbeDrag(['move', 'end'])
    }
  }

  private onValueChange(value: SliderValue): void {

  }

  private onTouched(): void {};

  writeValue(value: SliderValue): void {
    this.setValue(value, true);
  }
  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onValueChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  ngOnDestroy(): void {
    this.unsubscrbeDrag();
   }

}
