import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush // 更改组件变更策略
})
export class WyCarouselComponent implements OnInit {
  @Input() activeIndex = 0;
  @Output() changeSlide = new EventEmitter<'pre' | 'next'>();

  // 若dot模板是动态的，那么static应该设置为false，即变更检测之后去
  @ViewChild('dot', {static: true})  dotRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

  onChangeSlide(type: 'pre' | 'next') { // type只能为pre或next，可以减少出错率
    this.changeSlide.emit(type);
  }

}
