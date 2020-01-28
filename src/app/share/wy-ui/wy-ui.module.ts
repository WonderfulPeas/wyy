import { NgModule } from '@angular/core';
import { SingleSheetComponent } from './single-sheet/single-sheet.component';
import { PlayCountPipe } from '../pipes/play-count.pipe';


// 通用ui组件
@NgModule({
  declarations: [SingleSheetComponent, PlayCountPipe],
  imports: [ ],
  exports: [SingleSheetComponent, PlayCountPipe ]
})
export class WyUiModule { }
