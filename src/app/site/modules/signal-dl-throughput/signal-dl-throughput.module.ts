import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SignalDlThroughputComponent } from './signal-dl-throughput.component';



@NgModule({
  declarations: [SignalDlThroughputComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SignalDlThroughputComponent]
})
export class SignalDlThroughputModule { }
