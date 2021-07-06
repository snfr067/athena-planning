import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  /**
   * 計算圖長寬
   * @param calculateForm 
   * @param gd 
   */
  calSize(calculateForm: CalculateForm, gd) {
    
    let layoutWidth = gd.clientWidth;
    let layoutHeight = gd.clientHeight;
    if (Number(calculateForm.width) < Number(calculateForm.height)) {
      const ratio = calculateForm.width / calculateForm.height;
      layoutWidth = layoutHeight * ratio + 160;
    } else if (Number(calculateForm.width) > Number(calculateForm.height)) {
      const ratio = calculateForm.height / calculateForm.width;
      layoutHeight = layoutWidth * ratio;
      const winHeight = window.innerHeight - 150;
      if (layoutHeight > winHeight) {
        const wRatio = winHeight / layoutHeight;
        layoutHeight = winHeight;
        layoutWidth = layoutWidth * wRatio + 100;
        if (layoutWidth > gd.clientWidth) {
          layoutWidth = gd.clientWidth;
        }
      }
    } else {
      layoutWidth = layoutHeight + 180;
    }
    return [layoutWidth, layoutHeight];
  }
}
