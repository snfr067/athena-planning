import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SignalUlThroughputComponent } from './signal-ul-throughput.component';



@NgModule({
  declarations: [SignalUlThroughputComponent],
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  exports: [SignalUlThroughputComponent]
})
export class SignalUlThroughputModule { }
