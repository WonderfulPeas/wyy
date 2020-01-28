import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { Banner, HotTag, SongSheet } from 'src/app/services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  public banners: Banner[];
  public hotTags: HotTag[];
  public songSheetList: SongSheet[];
  public carouselActiveIndex = 0;
  @ViewChild(NzCarouselComponent, {static: true}) private nzCarousel: NzCarouselComponent;
  constructor(
    private homeSer: HomeService
  ) {}

  ngOnInit() {
    this.getBanners();
    this.getHotTags();
    this.getPersonalizedSheetList();
  }

  private getBanners() {
    this.homeSer.getBanners().subscribe(banners => {
      // console.log('banners:', banners);
      this.banners = banners;
    });
  }

  private getHotTags() {
    this.homeSer.getHotTags().subscribe(tags => {
      // console.log('tags:', tags);
      this.hotTags = tags;
    });
  }

   // 获取推荐歌单
  private getPersonalizedSheetList() {
    this.homeSer.getPersonalSheetList().subscribe(sheets => {
      console.log('sheetsss:', sheets);
      this.songSheetList = sheets;
    });
  }

  onBeforeChange({ to }) {
      this.carouselActiveIndex = to;
  }

  onChangeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }

}
