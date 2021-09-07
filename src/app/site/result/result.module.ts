import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultComponent } from './result.component';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatButtonModule } from '@angular/material/button';
import { SitePlanningMapModule } from '../modules/site-planning-map/site-planning-map.module';
import { PerformanceModule } from '../modules/performance/performance.module';
import { ProposeModule } from '../modules/propose/propose.module';
import { SignalCoverModule } from '../modules/signal-cover/signal-cover.module';
import { SignalQualityModule } from '../modules/signal-quality/signal-quality.module';
import { SignalStrengthModule } from '../modules/signal-strength/signal-strength.module';
import { SiteInfoModule } from '../modules/site-info/site-info.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { PdfModule } from '../pdf/pdf.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SignalDlThroughputModule } from '../modules/signal-dl-throughput/signal-dl-throughput.module';
import { SignalUlThroughputModule } from '../modules/signal-ul-throughput/signal-ul-throughput.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonToggleModule,
    SitePlanningMapModule,
    // MatButtonModule,
    PerformanceModule,
    ProposeModule,
    SignalCoverModule,
    SignalQualityModule,
    SignalStrengthModule,
    SiteInfoModule,
    StatisticsModule,
    PdfModule,
    TranslateModule,
    MatCheckboxModule,
    NgxSliderModule,
    SignalDlThroughputModule,
    SignalUlThroughputModule
  ],
  declarations: [ResultComponent]
})
export class ResultModule {
}
