import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

declare var Plotly: any;

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

    // console.log(calculateForm.width);
    // console.log(calculateForm.height);
    // console.log(layoutWidth);
    // console.log(layoutHeight);
    if (Number(calculateForm.width) < Number(calculateForm.height)) {
      const ratio = calculateForm.width / calculateForm.height;
      // layoutWidth = layoutHeight * ratio;
      layoutWidth = layoutHeight * ratio + 160;
      if (layoutWidth > gd.clientWidth) {
        // has scroll bar
        layoutWidth = gd.clientWidth;
        const wRatio = calculateForm.height / calculateForm.width;
        layoutHeight = layoutWidth * wRatio;
      }
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
      if (layoutHeight > gd.clientHeight) {
        // has scroll bar
        layoutHeight = gd.clientHeight;
        const wRatio = calculateForm.width / calculateForm.height;
        layoutWidth = layoutHeight * wRatio;
      }
    } else {
      const marginSize = 80;
      layoutWidth = layoutHeight + marginSize;
      if (layoutWidth > gd.clientWidth) {
        // has scroll bar
        layoutWidth = gd.clientWidth;
        layoutHeight = layoutWidth - marginSize;
      }
    }
    
    return [layoutWidth, layoutHeight];
  }

  /**
   * show/hide 障礙物
   * @param visible 
   * @param rectList 
   * @param shapes 
   * @param annotations 
   * @param gd 
   */
  switchShowObstacle(visible, rectList, shapes, annotations, gd) {
    for (const item of rectList) {
      item.style['visibility'] = visible;
    }
    const shapeVisible = (visible === 'visible') ? true : false;
    for (const item of shapes) {
      // 顏色區分圓形障礙物與BS
      if (item.type === 'circle' && item.fillcolor === '#000000') {
        item.visible = shapeVisible;
      }
    }
    Plotly.relayout(gd, {
      shapes: shapes,
      annotations: annotations
    });
  }

}
