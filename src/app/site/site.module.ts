import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { SitePlanningModule } from './site-planning/site-planning.module';
import { View3dModule } from './view3d/view3d.module';
import { ResultModule } from './result/result.module';
import { RouterModule } from '@angular/router';
import { SignalUlThroughputComponent } from './modules/signal-ul-throughput/signal-ul-throughput.component';
import { SignalDlThroughputComponent } from './modules/signal-dl-throughput/signal-dl-throughput.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SiteRoutingModule,
    SitePlanningModule,
    View3dModule,
    ResultModule
  ],
  declarations: [SignalUlThroughputComponent, SignalDlThroughputComponent]
})
export class SiteModule { }
