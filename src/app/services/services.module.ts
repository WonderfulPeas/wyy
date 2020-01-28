import { NgModule, InjectionToken } from '@angular/core';
// 令牌
export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [
  ],
  providers: [
    {provide: API_CONFIG, useValue: 'http://localhost:3000/'}
  ]
})
export class ServicesModule { }
