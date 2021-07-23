import { Component, OnInit, Input, HostListener, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { Options } from '@angular-slider/ngx-slider';
import { ChartService } from '../../../service/chart.service';

declare var Plotly: any;

/**
 * 訊號覆蓋圖
 */
@Component({
  selector: 'app-signal-cover',
  templateUrl: './signal-cover.component.html',
  styleUrls: ['./signal-cover.component.scss']
})
export class SignalCoverComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private chartService: ChartService
  ) { }

  /** 結果form */
  calculateForm = new CalculateForm();
  /** 結果data */
  result = {};
  /** 障礙物list */
  rectList = [];
  /** AP list */
  candidateList = [];
  /** 現有基站 list */
  defaultBsList = [];
  /** UE list */
  ueList = [];
  /** 外框style */
  style = {};
  /** 圖id */
  chartId;
  /** show UE */
  showUE = true;
  /** 圖區style */
  divStyle = {
    position: 'relative',
    opacity: 0
  };
  /** 高度 */
  zValue = '1';
  /** 障礙物顯示 */
  showObstacle = 'visible';
  /** BS顯示 */
  showBs = 'visible';
  /** AP顯示 */
  showCandidate = true;
  /** slide */
  opacityValue: number = 0.8;
  /** AP */
  shapes = [];
  /** AP文字 */
  annotations = [];
  /** traces */
  traces = [];
  /** 障礙物element */
  @ViewChildren('obstaclecElm') obstacleElm: QueryList<ElementRef>;

  @HostListener('window:resize') windowResize() {
    Plotly.relayout(this.chartId, {
      autosize: true
    }).then(gd => {

      const sizes = this.chartService.calSize(this.calculateForm, gd);
      const layoutOption = {
        width: sizes[0],
        height: sizes[1]
      };
      Plotly.relayout(this.chartId, layoutOption);
    });
  }

  ngOnInit(): void {
  }

  /**
   * 畫圖
   * @param isPDF 
   * @param zValue 
   */
  draw(isPDF, zValue) {
    this.zValue = zValue;
    const images = [];
    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {
        // background image
        images.push({
          source: reader.result.toString(),
          x: 0,
          y: 0,
          sizex: this.calculateForm.width,
          sizey: this.calculateForm.height,
          xref: 'x',
          yref: 'y',
          xanchor: 'left',
          yanchor: 'bottom',
          sizing: 'stretch',
          layer: 'below'
        });

        this.drawChart(isPDF, images);
      };

    } else {
      this.drawChart(isPDF, images);
    }

  }

  /**
   * 畫圖
   * @param isPDF 
   * @param images 
   */
  drawChart(isPDF, images) {
    const defaultPlotlyConfiguration = {
      displaylogo: false,
      showTips: false,
      editable: false,
      scrollZoom: false,
      displayModeBar: false
    };

    this.rectList.length = 0;
    this.defaultBsList.length = 0;
    this.candidateList.length = 0;
    this.ueList.length = 0;

    const layout = {
      autosize: true,
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.width],
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        ticks: 'inside',
        ticksuffix: 'm'
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.height],
        showgrid: false,
        zeroline: false,
        fixedrange: true,
        ticks: 'inside',
        ticksuffix: 'm'
      },
      margin: { t: 20, b: 20, l: 40, r: 5},
      images: images,
      hovermode: 'closest'
    };

    const zValues = JSON.parse(this.calculateForm.zValue.toString());

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelectorAll(`.signal_cover`)[zValues.indexOf(Number(this.zValue))];
    } else {
      id = document.querySelectorAll(`.signal_cover`)[0];
    }
    this.chartId = id;

    const defaultBs = [];
    // 現有基站
    if (this.calculateForm.defaultBs !== '') {
      let num = 1;

      const list = this.calculateForm.defaultBs.split('|');
      const cx = [];
      const cy = [];
      const ctext = [];
      for (const item of list) {
        const oData = JSON.parse(item);
        defaultBs.push(oData);
        const xdata = oData[0];
        const ydata = oData[1];
        const zdata = oData[2];
        cx.push(xdata);
        cy.push(ydata);

        const text = `${this.translateService.instant('defaultBs')}
        X: ${xdata}
        Y: ${ydata}
        ${this.translateService.instant('altitude')}: ${zdata}`;
        ctext.push(text);
        this.defaultBsList.push({
          x: xdata,
          y: ydata,
          color: 'green',
          hover: text,
          ap: `${this.translateService.instant('default')}${num}`,
          style: {
            // visibility: this.showBs,
            opacity: 0
          },
          circleStyle: {
            // visibility: this.showBs
          }
        });
        num++;
      }
    }

    const zLen = zValues.length;
    const zData = [];
    const allZ = [];
    const zText = [];
    for (let i = 0; i < zLen; i++) {
      zData.push([]);
      allZ.push([]);
      zText.push([]);
    }
    let xIndex = 0;
    // console.log(this.result['connectionMap']);
    for (const item of this.result['connectionMap']) {
      for (let i = 0; i < zLen; i++) {
        // console.log(item)
        let yIndex = 0;
        for (const yData of item) {
        // console.log(yData)
          if (typeof zData[i][yIndex] == 'undefined') {
            zData[i][yIndex] = [];
            zText[i][yIndex] = [];
          }
          zData[i][yIndex][xIndex] = yData[i];
          zText[i][yIndex][xIndex] = yData[i];
          yIndex++;
          if (!allZ[i].includes(yData[i]) && yData[i] != null) {
            allZ[i].push(yData[i]);
          }
        }
      }
      xIndex++;
    }
    // 取z的最大值
    const zMax = [];
    const zMin = [];
    for (const item of allZ) {
      zMax.push(Plotly.d3.max(item));
      zMin.push(Plotly.d3.min(item));
    }

    console.log(`distinct connectionMap data`, allZ[zValues.indexOf(Number(this.zValue))]);

    const x = [];
    const y = [];
    const wRatio = this.calculateForm.width / this.result['connectionMap'].length;
    let xval = 0;
    const xLen = this.result['connectionMap'].length;
    for (let i = 0; i <= xLen; i++) {
      x.push(xval);
      xval += wRatio;
    }
    const hRatio = this.calculateForm.height / this.result['connectionMap'][0].length;
    let yval = 0;
    const yLen = this.result['connectionMap'][0].length;
    for (let i = 0; i <= yLen; i++) {
      y.push(yval);
      yval += hRatio;
    }
    this.traces = [];

    // UE
    if (this.calculateForm.ueCoordinate !== '') {
      const list = this.calculateForm.ueCoordinate.split('|');
      const cx = [];
      const cy = [];
      const text = [];
      for (const item of list) {
        const oData = JSON.parse(item);
        if (oData[2] !== this.zValue) {
          continue;
        }
        cx.push(oData[0]);
        cy.push(oData[1]);
        text.push(`${this.translateService.instant('ue')}<br>X: ${oData[0]}<br>Y: ${oData[1]}<br>${this.translateService.instant('altitude')}: ${oData[2]}`);
      }

      this.traces.push({
        x: cx,
        y: cy,
        text: text,
        marker: {
          color: '#140101',
        },
        type: 'scatter',
        mode: 'markers',
        hoverinfo: 'none',
        showlegend: false,
        visible: this.showUE
      });
    }

    let hasBS = false;
    if (this.calculateForm.isSimulation) {
      if (this.calculateForm.bsList !== '') {
        hasBS = true;
      }
    } else {
      if (this.calculateForm.candidateBs !== '') {
        hasBS = true;
      }
    }

    let colorscale: any = [
      [0, 'rgb(12,51,131)'],
      [0.25, 'rgb(10,136,186)'],
      [0.5, 'rgb(242,211,56)'],
      [0.75, 'rgb(242,143,56)'],
      [1, 'rgb(217,30,30)']
    ];

    let allZero = true;
    for (const item of zData[zValues.indexOf(Number(this.zValue))]) {
      for (const d of item) {
        if (d != null && d !== 0) {
          allZero = false;
        }
      }
    }

    // 圖區右邊建議基站
    if (hasBS) {
      
      // if (this.calculateForm.isSimulation) { //isSimulation works
      //   list = this.calculateForm.bsList.split('|');
      // } else {
      //   list = this.calculateForm.candidateBs.split('|');
      // }
      const apMap = {};
      // 對應connectionMap的編號
      let legendNum = 0;

      if (this.calculateForm.candidateBs != "") {
        let list;
        list = this.calculateForm.candidateBs.split('|');
        const cx = [];
        const cy = [];

        for (let j = 0; j < list.length; j++) {
          const oData = JSON.parse(list[j]);
          // legend編號有包含在connectionMap裡
          if (allZ[zValues.indexOf(Number(this.zValue))].includes(j)) {
            cx.push(oData[0]);
            cy.push(oData[1]);

            const z = zData[zValues.indexOf(Number(this.zValue))][Math.floor(oData[1])][Math.floor(oData[0])];
            const max = zMax[zValues.indexOf(Number(this.zValue))];
            const min = zMin[zValues.indexOf(Number(this.zValue))];
            // legend
            let color;

            if (allZero && this.result['chosenCandidate'].length === 1) {
              color = 'rgb(12,51,131)';
            } else {
              const zDomain = [];
              const colorRange = [];
              for (let n = 0; n < colorscale.length; n++) {
                zDomain.push((max - min) * colorscale[n][0] + min);
                colorRange.push(colorscale[n][1]);
              }
              // 套件提供用range計算的方法
              const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
              color = colorFN(z);
            }

            // legend編號有在connectionMap裡的才呈現
            if (allZ[zValues.indexOf(Number(this.zValue))].includes(legendNum)) {
              // legend
              this.traces.push({
                x: [0],
                y: [0],
                name: `${this.translateService.instant('result.propose.candidateBs')} ${(j + 1)}`,
                marker: {
                  color: color,
                },
                type: 'bar',
                hoverinfo: 'none',
                showlegend: true
              });

              // tooltip對應用
              apMap[z] = `${this.translateService.instant('result.propose.candidateBs')} ${(j + 1)}`;

              this.candidateList.push({
                x: oData[0],
                y: oData[1],
                num: (j + 1),
                color: '#f7176a',
                ap: `${this.translateService.instant('candidate')}${(j + 1)}`
              });
            }
          } else {
            console.log(`miss ${this.translateService.instant('candidate')} legend num ${legendNum}`);
          }

          legendNum++;
        }
      }
      
      if (defaultBs.length > 0) {
        let k = 1;
        // const candidateidx = this.result['candidateIdx'];
        for (let i = 0; i < defaultBs.length; i++) {
          const oData = defaultBs[i];
          if (typeof zData[zValues.indexOf(Number(this.zValue))][Math.floor(oData[1])] === 'undefined') {
            continue;
          }
          const z = zData[zValues.indexOf(Number(this.zValue))][Math.floor(oData[1])][Math.floor(oData[0])];
          const max = zMax[zValues.indexOf(Number(this.zValue))];
          const min = zMin[zValues.indexOf(Number(this.zValue))];
          // Xean: 07/10 add legend color改用計算的
          let color;
          if (allZero && defaultBs.length === 1) {
            // 只有一個都是0的基站指定為藍色
            color = 'rgb(12,51,131)';
          } else {
            const zDomain = [];
            const colorRange = [];
            for (let n = 0; n < colorscale.length; n++) {
              zDomain.push((max - min) * colorscale[n][0] + min);
              colorRange.push(colorscale[n][1]);
            }
            // 套件提供用range計算的方法
            const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
            color = colorFN(z);
          }

          // legend編號有在connectionMap裡的才呈現
          if (allZ[zValues.indexOf(Number(this.zValue))].includes(legendNum)) {
            this.traces.push({
              x: [0],
              y: [0],
              name: `${this.translateService.instant('defaultBs')} ${k}`,
              marker: {
                color: color,
              },
              type: 'bar',
              hoverinfo: 'none',
              showlegend: true
            });
  
            apMap[z] = `${this.translateService.instant('defaultBs')} ${k}`;
          } else {
            console.log(`miss ${this.translateService.instant('default')} legend num ${legendNum}`);
          }
          
          legendNum++;
          k++;
        }
      }
      
      console.log(`apMap`, apMap);

      // 重新指定連線對象tooltip
      xIndex = 0;
      for (const item of this.result['connectionMap']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            // console.log(yData)
            if (typeof apMap[yData[i]] === 'undefined') {
              zText[i][yIndex][xIndex] = '無';
            } else {
              // console.log(yData[i], apMap[yData[i]])
              zText[i][yIndex][xIndex] = apMap[yData[i]];
            }
            yIndex++;
          }
        }
        xIndex++;
      }
    }

    

    if (allZero) {
      colorscale = [
        [0, 'rgb(12,51,131)'],
        [1, 'rgb(12,51,131)']
      ];
    }

    const trace = {
      x: x,
      y: y,
      z: zData[zValues.indexOf(Number(this.zValue))],
      text: zText[zValues.indexOf(this.zValue)],
      colorscale: colorscale,
      type: 'heatmap',
      hovertemplate: `X: %{x}<br>Y: %{y}<br>${this.translateService.instant('ap.num')}: %{text}<extra></extra>`,
      showscale: false,
      zsmooth: 'fast',
      opacity: this.opacityValue,
      uid: 'heatmap'
    };
    this.traces.push(trace);

    console.log(this.traces);

    this.shapes.length = 0;

    // 障礙物
    if (this.calculateForm.obstacleInfo !== '') {
      const obstacle = this.calculateForm.obstacleInfo.split('|');
      for (const item of obstacle) {
        const oData = JSON.parse(item);
        const xdata = oData[0];
        const ydata = oData[1];
        const oColor = '#000000';
        // 0~3分別是矩型、三角形、圓形、梯形
        let shape = oData[7];
        let text = `${this.translateService.instant('planning.obstacleInfo')}
        X: ${xdata}
        Y: ${ydata}
        ${this.translateService.instant('width')}: ${oData[2]}
        ${this.translateService.instant('height')}: ${oData[3]}
        ${this.translateService.instant('altitude')}: ${oData[4]}
        `;
        if (typeof oData[6] !== 'undefined') {
          text += `${this.translateService.instant('material')}: ${this.authService.parseMaterial(oData[6])}`;
        }
        if (typeof oData[7] === 'undefined') {
          shape = '0';
        }
        const rotate = oData[5];

        this.rectList.push({
          x: xdata,
          y: ydata,
          width: oData[2],
          height: oData[3],
          rotate: oData[5],
          shape: shape,
          style: {
            left: 0,
            top: 0,
            width: oData[2],
            height: oData[3],
            // transform: `rotate(${oData[5]}deg)`,
            position: 'absolute',
            visibility: this.showObstacle,
            opacity: 0
          },
          svgStyle: {
            width: oData[2],
            height: oData[3],
            fill: oColor,
          },
          hover: text
        });

      }
    }

    Plotly.newPlot(id, {
      data: this.traces,
      layout: layout,
      config: defaultPlotlyConfiguration
    }).then((gd) => {
      const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
      const rect = xy.getBoundingClientRect();

      let layoutOption = {};
      this.annotations.length = 0;

      const xLinear = Plotly.d3.scale.linear()
        .domain([0, rect.width])
        .range([0, this.calculateForm.width]);

      const yLinear = Plotly.d3.scale.linear()
        .domain([0, rect.height])
        .range([0, this.calculateForm.height]);
      // 新增基站
      if (this.calculateForm.candidateBs !== '') {
        

        
        for (const item of this.candidateList) {
          this.shapes.push({
            type: 'rect',
            xref: 'x',
            yref: 'y',
            x0: item.x,
            y0: item.y,
            x1: item.x + Number(xLinear(50)),
            y1: item.y + Number(yLinear(18)),
            fillcolor: '#003060',
            visible: this.showCandidate
          });

          this.annotations.push({
            x: item.x + Number(xLinear(25)),
            y: item.y + Number(yLinear(9)),
            xref: 'x',
            yref: 'y',
            text: item.ap.replace(this.translateService.instant('result.propose.candidateBs'), 'BS'),
            showarrow: false,
            font: {
              color: '#fff',
              size: 10
            },
            visible: this.showCandidate
          });
        }
      }

      if (this.calculateForm.defaultBs !== '') {
        for (const item of this.defaultBsList) {
          this.shapes.push({
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: item.x,
            y0: item.y,
            x1: item.x + Number(xLinear(50)),
            y1: item.y + Number(yLinear(18)),
            fillcolor: '#005959',
            bordercolor: '#005959',
            visible: this.showBs
          });

          this.annotations.push({
            x: item.x + Number(xLinear(25)),
            y: item.y + Number(yLinear(9)),
            xref: 'x',
            yref: 'y',
            text: item.ap,
            showarrow: false,
            font: {
              color: '#fff',
              size: 10
            },
            visible: this.showBs
          });
        }
      }

      // 尺寸跟場域設定一樣
      const sizes = JSON.parse(sessionStorage.getItem('layoutSize'));
      // const sizes = this.chartService.calSize(this.calculateForm, gd);
      layoutOption = {
        width: sizes.width + 80,
        height: sizes.height,
        shapes: this.shapes,
        annotations: this.annotations
      };

      if (images.length > 0) {
        const image = new Image();
        image.src = images[0].source;
        image.onload = () => {
          this.reLayout(id, layoutOption);
        };
        
      } else {
        this.reLayout(id, layoutOption);
      }
    });
  }

  /**
   * 畫好圖後重新計算比例尺
   * @param id 
   * @param layoutOption 
   */
  reLayout(id, layoutOption) {
    Plotly.relayout(id, layoutOption).then((gd2) => {
      this.divStyle.opacity = 1;
      const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
      const rect2 = xy2.getBoundingClientRect();
      gd2.style.opacity = 0.85;
      gd2.querySelectorAll('.plotly')[0].style.opacity = 0.85;

      this.style = {
        left: `${xy2.getAttribute('x')}px`,
        top: `${xy2.getAttribute('y')}px`,
        width: `${rect2.width}px`,
        height: `${rect2.height}px`,
        position: 'absolute'
      };

      const pixelXLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.width])
        .range([0, rect2.width]);

      const pixelYLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.height])
        .range([0, rect2.height]);

      for (const item of this.rectList) {
        console.log(item)
        // 障礙物加粗，07/20 註解障礙物加粗，避免位置看似偏移
        let width = pixelXLinear(item.width);
        // if (width < 5) {
        //   width = 5;
        // }
        let height = pixelYLinear(item.height);
        // if (height < 5) {
        //   height = 5;
        // }

        const leftPosition = pixelXLinear(item.x);
console.log(width, height)
        item['style'].top = `${rect2.height - height - pixelYLinear(item.y)}px`;
        item['style'].left = `${leftPosition}px`;
        item['style'].width = `${width}px`;
        item['style'].height = `${height}px`;
        item['svgStyle'].width = `${width}px`;
        item['svgStyle'].height = `${height}px`;
        if (item.shape === 1) {
          const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          item['points'] = points;
          console.log(item, points);
        } else if (item.shape === 2) {
          item['ellipseStyle'] = {
            cx: width / 2,
            cy: height / 2,
            rx: width / 2,
            ry: height / 2
          };
        }

        // 延遲轉角度，讓位置正確
        window.setTimeout(() => {
          item['style']['transform'] = `rotate(${item.rotate}deg)`;
          item['style'].opacity = 1;
        }, 0);
      }

      for (const item of this.defaultBsList) {
        item['style'] = {
          left: `${pixelXLinear(item.x)}px`,
          bottom: `${pixelYLinear(item.y)}px`,
          position: 'absolute'
        };
        item['circleStyle'] = {
          left: `${pixelXLinear(item.x) + 15}px`,
          bottom: `${pixelYLinear(item.y) + 25}px`,
          position: 'absolute'
        };
      }
      // 新增基站
      const xy3: SVGRectElement = gd2.querySelector('.xy');
      const rect3 = xy3.getBoundingClientRect();
      const candisateXLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.width])
        .range([0, rect3.width]);

      const candisateYLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.height])
        .range([0, rect3.height]);
      for (const item of this.candidateList) {
        item['style'] = {
          left: `${candisateXLinear(item.x)}px`,
          bottom: `${candisateYLinear(item.y)}px`,
          position: 'absolute',
          // visibility: this.showCandidate
        };
        item['circleStyle'] = {
          left: `${candisateXLinear(item.x) + 15}px`,
          bottom: `${candisateYLinear(item.y) + 25}px`,
          position: 'absolute',
          // visibility: this.showCandidate
        };
      }

    });
  }

  /** 亂數顏色 */
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  /**
   * show/hide UE
   * @param visible 
   */
  switchUE(visible) {
    Plotly.restyle(this.chartId, {
      visible: visible
    }, [0]);
  }

  /**
   * show/hide 障礙物
   * @param visible 
   */
  switchShowObstacle(visible) {
    this.chartService.switchShowObstacle(visible, this.rectList, this.shapes, this.annotations, this.chartId);
  }

  /**
   * show/hide BS
   * @param visible 
   */
  switchShowBs(visible) {
    if (visible == 'visible') {visible = true;} else {visible = false;}

    // Plotly.restyle(this.chartId, {
    //   visible: visible
    // }, [4]);

    for (const item of this.shapes) {
      if (item.type == 'circle' && item.fillcolor === '#005959') {
        item.visible = visible;
      }
    }
    for (const item of this.annotations) {
      if (item.text[0] == '既') {
        item.visible = visible;
      }
    }

    Plotly.relayout(this.chartId, {
      shapes: this.shapes,
      annotations: this.annotations
    });
  }

  /**
   * show/hide AP
   * @param visible 
   */
  switchShowCandidate(visible) {
    // Plotly.restyle(this.chartId, {
    //   visible: visible
    // }, [4]);

    for (const item of this.shapes) {
      if (item.type == 'rect') {
        item.visible = visible;
      }
    }
    for (const item of this.annotations) {
      if (item.text[0] == '待') {
        item.visible = visible;
      }
    }

    Plotly.relayout(this.chartId, {
      shapes: this.shapes,
      annotations: this.annotations
    });
  }

  /** heatmap透明度 */
  changeOpacity() {
    const chartElm = document.querySelectorAll(`.signal_cover`)[0];
    for (let i = 0; i < this.traces.length; i++) {
      if (typeof this.traces[i].uid !== 'undefined') {
        if (this.traces[i].uid === 'heatmap') {
          Plotly.restyle(chartElm, {
            opacity: this.opacityValue
          }, [i]);
        }
      }
    }
    
  }

}
