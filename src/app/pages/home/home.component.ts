import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/data-types/common.types';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { SingerService } from 'src/app/services/singer.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators';
import { SheetService } from 'src/app/services/sheet.service ';

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
    private route: ActivatedRoute,
    private sheetServe: SheetService,
  ) {}

  ngOnInit() {
     this.route.data.pipe(map(res => res.homeData)).subscribe(([banners, tags, sheets, singers]) => {
     this.banners = banners;
     this.hotTags = tags;
     this.songSheetList = sheets;
     this.singers = singers;
    });
  }

  onBeforeChange({ to }) {
      this.carouselActiveIndex = to;
  }

  onChangeSlide(type: 'pre' | 'next') {
    this.nzCarousel[type]();
  }

  onPlaySheet(id: number) {
    console.log('id', id);
    this.sheetServe.playSheet(id).subscribe(res => {
      console.log('res:', res);
    });
  }

}
