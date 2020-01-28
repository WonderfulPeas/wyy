import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { SingerService } from 'src/app/services/singer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  public banners: Banner[];
  public hotTags: HotTag[];
  public songSheetList: SongSheet[];
  public singers: Singer[];
  public carouselActiveIndex = 0;
  @ViewChild(NzCarouselComponent, {static: true}) private nzCarousel: NzCarouselComponent;
  constructor(
    private homeSer: HomeService,
    private singerSer: SingerService,
  ) {}

  ngOnInit() {
    this.getBanners();
    this.getHotTags();
    this.getPersonalizedSheetList();
    this.getEnterSingers();
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
      // console.log('sheetsss:', sheets);
      this.songSheetList = sheets;
    });
  }

  // 获取驻入歌手
  private getEnterSingers() {
    this.singerSer.getEnterSinger().subscribe(singer => {
      console.log('singer:', singer);
      this.singers = singer;
    });
  }

  onBeforeChange({ to }) {
      this.carouselActiveIndex = to;
  }

  onChangeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }

}
