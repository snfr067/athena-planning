import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SitePlanningMapComponent } from './site-planning-map.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SitePlanningMapComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SitePlanningMapComponent]
})
export class SitePlanningMapModule { }
