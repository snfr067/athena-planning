import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

declare var Plotly: any;

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  /** 左邊圖保留空間 */
  public leftSpace = 70;

  /**
   * 計算圖長寬
   * @param calculateForm 
   * @param gd 
   */
  async calSize(calculateForm: CalculateForm, gd) {
    // 場域1/3寬高度
    const halfHeight = document.getElementById('chart').clientWidth * 0.3;
    const halfWidth = (window.innerHeight - 150) / 2;
    let layoutWidth = gd.clientWidth;
    let layoutHeight = gd.clientHeight;
    // marginSize 60 grid才能維持正方形
    const marginSize = 60;
    // console.log(calculateForm.width);
    // console.log(calculateForm.height);
    // console.log(layoutWidth);
    // console.log(layoutHeight);
    if (Number(calculateForm.width) < Number(calculateForm.height)) {
      const ratio = calculateForm.width / calculateForm.height;      
      layoutWidth = layoutHeight * ratio + 160;
      if (layoutWidth > gd.clientWidth) {
        // has scroll bar
        layoutWidth = gd.clientWidth;
        const wRatio = calculateForm.height / calculateForm.width;
        layoutHeight = layoutWidth * wRatio;
      }
      layoutWidth += marginSize;

      if (layoutWidth < halfWidth) {
        layoutWidth = halfWidth;
        layoutHeight = layoutWidth * (calculateForm.height / calculateForm.width);
      }

    } else if (Number(calculateForm.width) > Number(calculateForm.height)) {
      const ratio = calculateForm.height / calculateForm.width;
      layoutHeight = layoutWidth * ratio;
      
      // if (layoutHeight < halfHeight) {
      //   layoutHeight = halfHeight;
      //   layoutWidth = layoutHeight * (calculateForm.width / calculateForm.height);
      // }
      const winHeight = window.innerHeight - 150;
      if (layoutHeight > winHeight) {
        const wRatio = winHeight / layoutHeight;
        layoutHeight = winHeight;
        layoutWidth = layoutWidth * wRatio + 100;
        if (layoutWidth > gd.clientWidth) {
          layoutWidth = gd.clientWidth;
        }
      }
      if (layoutHeight < halfHeight) {
        layoutHeight = halfHeight;
        layoutWidth = layoutHeight * (calculateForm.width / calculateForm.height);
      }
      // if (layoutHeight > gd.clientHeight) {
      //   // has scroll bar
      //   layoutHeight = gd.clientHeight;
      //   const wRatio = calculateForm.width / calculateForm.height;
      //   layoutWidth = layoutHeight * wRatio;
      // }
      // layoutWidth += marginSize;
    } else {
      
      layoutWidth = layoutHeight + marginSize;
      if (layoutWidth > gd.clientWidth) {
        // has scroll bar
        layoutWidth = gd.clientWidth;
        layoutHeight = layoutWidth - marginSize;
      }
    }
    // return [layoutWidth, layoutHeight]
    return await this.checkSize1(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight));
  }

  /** 用比例校正場域長寬 */
  async checkSize1(calculateForm: CalculateForm, gd, layoutWidth, layoutHeight) {
    return await Plotly.relayout(gd, {
      width: layoutWidth,
      height: layoutHeight
    }).then(gd2 => {
      const xy: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();

      const gridWidth = xy.width;
      const gridHeight = xy.height;

      const pixelXLinear = Plotly.d3.scale.linear()
          .domain([0, calculateForm.width])
          .range([0, gridWidth]);

      const pixelYLinear = Plotly.d3.scale.linear()
          .domain([0, calculateForm.height])
          .range([0, gridHeight]);
      
      // 模擬1個正方形
      const width = Math.ceil(pixelXLinear(100));
      const height = Math.ceil(pixelYLinear(100));
      if (width !== height) {
        // 避免遞迴卡死，先用比例讓尺寸接近些
        if (width > height) {
          layoutWidth = layoutWidth * (height / width);
        } else if (width < height) {
          layoutHeight = layoutHeight * (width / height);
        }
      }

      return this.checkSize2(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight));
    });
  }

  /** 進階校正場域長寬 */
  async checkSize2(calculateForm: CalculateForm, gd, layoutWidth, layoutHeight) {

    const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();

    const gridWidth = xy.width;
    const gridHeight = xy.height;

    const pixelXLinear = Plotly.d3.scale.linear()
        .domain([0, calculateForm.width])
        .range([0, gridWidth]);

    const pixelYLinear = Plotly.d3.scale.linear()
        .domain([0, calculateForm.height])
        .range([0, gridHeight]);
    
    // 模擬1個正方形
    const width = Math.ceil(pixelXLinear(100));
    const height = Math.ceil(pixelYLinear(100));
    
    if (width !== height) {
      // 結果非正方形時，每次變更1px場域大小至正方形為止
      if (width > height) {
        layoutWidth--;
      } else if (width < height) {
        layoutHeight--;
      }

      return await Plotly.relayout(gd, {
        width: layoutWidth,
        height: layoutHeight
      }).then(gd2 => {
        // console.log(width, height, layoutWidth, layoutHeight);
        return this.checkSize2(calculateForm, gd2, layoutWidth, layoutHeight);
      });

    } else {
      // 結果為正方形
      console.log(width, height, layoutWidth, layoutHeight);
    }
    // console.log(layoutWidth, layoutHeight);
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

  /**
   * 計算結果頁圖長寬
   * @param calculateForm 
   * @param gd 
   */
  async calResultSize(calculateForm: CalculateForm, gd, maxWidth) {
    
    let layoutWidth = gd.clientWidth;
    let layoutHeight = gd.clientHeight;
    const maxHeight = window.innerHeight - 150;
    if (layoutHeight > maxHeight) {
      layoutHeight = maxHeight;
    }

    const wRatio = calculateForm.height / calculateForm.width;

    const marginSize = 60;

    if (Number(calculateForm.width) < Number(calculateForm.height)) {
      const ratio = calculateForm.width / calculateForm.height;
      // layoutWidth = layoutHeight * ratio;
      layoutWidth = layoutHeight * ratio + 160;
      if (layoutWidth > gd.clientWidth) {
        // has scroll bar
        layoutWidth = gd.clientWidth;
        layoutHeight = layoutWidth * wRatio;
      }

    } else if (Number(calculateForm.width) > Number(calculateForm.height)) {
      
      layoutHeight = layoutWidth * wRatio;
      if (layoutHeight > maxHeight) {
        layoutHeight = maxHeight;
        layoutWidth = layoutWidth * wRatio + 100;
      }
      if (layoutWidth > gd.clientWidth) {
        layoutWidth = gd.clientWidth;
      }
    } else {
      layoutHeight = maxHeight;
      layoutWidth = layoutHeight + marginSize;
      if (layoutWidth > maxWidth) {
        // has scroll bar
        layoutWidth = maxWidth;
        layoutHeight = layoutWidth - marginSize;
      }
    }

    if (layoutWidth > maxWidth) {
      layoutWidth = maxWidth;
      layoutHeight = layoutWidth * wRatio;
    }
    
    // return [layoutWidth, layoutHeight];
    return await this.checkSize1(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight));
  }

  /*getPosByAngle(angleDeg, width, height)
  {
    let angleRad = angleDeg * Math.PI / 180;
    let tan = 1;
    let retX = width;
    let retY = height;

    if (angleRad == 90 || angleRad == 270)
    {

    }
      Math.tan(angleRad);


    retY = width * tan;

    if (retY < height)
    {
      retY *= height / retY;
      retX *= height / retY;
    }

    return [retX, retY];
  }*/
}
