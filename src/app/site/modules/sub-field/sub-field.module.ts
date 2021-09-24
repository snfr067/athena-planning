import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubFieldComponent } from './sub-field.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [SubFieldComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [SubFieldComponent]
})
export class SubFieldModule { }
