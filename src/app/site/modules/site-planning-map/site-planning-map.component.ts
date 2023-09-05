import { Component, OnInit, Input, HostListener, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { ChartService } from '../../../service/chart.service';
declare var Plotly: any;

@Component({
  selector: 'app-site-planning-map',
  templateUrl: './site-planning-map.component.html',
  styleUrls: ['./site-planning-map.component.scss']
})
export class SitePlanningMapComponent implements OnInit {

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
  /** 天線 list */
  antList = [];
  /** 外框style */
  style = {};
  /** 高度 */
  zValue = '';
  /** 圖id */
  chartId;
  /** show UE */
  showUE = true;
  /** 圖區style */
  divStyle = {
    position: 'relative',
    opacity:0
  };
  /** 障礙物顯示 */
  showObstacle = 'visible';
  /** AP顯示 */
  showCandidate = true;
  /** BS顯示 */
  showBs = 'visible';
  /** slide */
  opacityValue: number = 0.8;
  /** Max */
  maxZ = [];
  /** Min */
  minZ = [];
  /** AP */
  shapes = [];
  /** AP文字 */
  annotations = [];
  /** 顯示圖轉換的image */
  showImg = false;
  /** 圖轉換的image src */
  imageSRC = '';
  drawDown = false;

  /** 障礙物element */
  @ViewChildren('obstacleElm') obstacleElm: QueryList<ElementRef>;

  @HostListener('window:resize') windowResize() {
    const leftArea = <HTMLDivElement> document.querySelector('.leftArea');
    const maxWidth = leftArea.clientWidth - this.chartService.leftSpace;
    Plotly.relayout(this.chartId, {
      width: maxWidth
    }).then(gd => {
      this.chartService.calResultSize(this.calculateForm, gd, maxWidth).then(res => {
        const layoutOption = {
          width: res[0],
          height: res[1]
        };
        // resize layout
        this.reLayout(this.chartId, layoutOption, false);
      });
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
    //Initial
    this.rectList.length = 0;
    this.candidateList.length = 0;
    this.defaultBsList.length = 0;
    this.antList.length = 0; 
    //
    zValue = Number(zValue);
    this.zValue = zValue;
    const images = [];
    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {

        images.push({
          source: reader.result,
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
    // draw background image chart
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

    const layout = {
      autosize: true,
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.width],
        showgrid: false,
        zeroline: false,
        // fixedrange: true,
        ticks: 'inside',
        ticksuffix: 'm'
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.height],
        showgrid: false,
        zeroline: false,
        // fixedrange: false,
        ticks: 'inside',
        ticksuffix: 'm'
      },
      margin: { t: 20, b: 20, l: 40, r: (!this.authService.isEmpty(this.calculateForm.mapImage) ? 20 : 50)},
      images: images,
      hovermode: 'closest',
      shapes: [],
      annotations: []
    };

    const zValues = JSON.parse(this.calculateForm.zValue);

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelectorAll(`.site_map_chart`)[zValues.indexOf(this.zValue)];
    } else {
      id = document.querySelectorAll(`.site_map_chart`)[0];
    }
    this.chartId = id;

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
    for (let i = 0;i < this.result['sinrMap'][0][0].length;i++) {
      this.maxZ.push(this.result['sinrMap'][0][0][i]);
      this.minZ.push(this.result['sinrMap'][0][0][i]);
    }
    const mapX = [];
    const mapY = [];
    const mapColor = [];
    const mapText = [];
    for (const item of this.result['sinrMap']) {
      for (let i = 0; i < zLen; i++) {
        let yIndex = 0;
        for (const yData of item) {
          if (typeof zData[i][yIndex] == 'undefined') {
            zData[i][yIndex] = [];
            zText[i][yIndex] = [];
          }
          zData[i][yIndex][xIndex] = yData[i];
          if (Number(zData[i][yIndex][xIndex]) > this.maxZ[i]) {
            this.maxZ[i] = Number(zData[i][yIndex][xIndex]);
          }
          if (Number(zData[i][yIndex][xIndex]) < this.minZ[i]) {
            this.minZ[i] = Number(zData[i][yIndex][xIndex]);
          }
          if (yData[i] == null) {
            // console.log(`x:${xIndex}, y:${yIndex}, z:${i}, ${yData[i]}`);
            // console.log(item);
          }
          zText[i][yIndex][xIndex] = Math.round(yData[i] * 100) / 100;
          if (zText[i][yIndex][xIndex] >= 24) {
            mapColor.push('rgb(217,30,30)');
          } else if (zText[i][yIndex][xIndex] >= 23) {
            mapColor.push('rgb(242,143,56)');
          } else if (zText[i][yIndex][xIndex] >= 16) {
            mapColor.push('rgb(242,211,56)');
          } else if (zText[i][yIndex][xIndex] >= 8) {
            mapColor.push('green');
          } else if (zText[i][yIndex][xIndex] >= 0) {
            mapColor.push('rgb(10,136,186)');
          } else if (zText[i][yIndex][xIndex] < -8) {
            mapColor.push('rgb(12,51,131)');
          }

          mapX.push(xIndex);
          mapY.push(yIndex);
          mapText.push(zText[i][yIndex][xIndex]);

          yIndex++;
          allZ[i].push(yData[i]);
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

    const x = [];
    const y = [];
    const wRatio = this.calculateForm.width / this.result['sinrMap'].length;
    let xval = 0;
    const xLen = this.result['sinrMap'].length;
    for (let i = 0; i <= xLen; i++) {
      x.push(xval);
      xval += wRatio;
    }
    const hRatio = this.calculateForm.height / this.result['sinrMap'][0].length;
    let yval = 0;
    const yLen = this.result['sinrMap'][0].length;
    for (let i = 0; i <= yLen; i++) {
      y.push(yval);
      yval += hRatio;
    }


    const traces = [];
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

      traces.push({
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

    this.shapes.length = 0;

    // 障礙物
    if (this.calculateForm.obstacleInfo !== '') {
      const obstacle = this.calculateForm.obstacleInfo.split('|');
      for (const item of obstacle) {
        const oData = JSON.parse(item);
        const xdata = oData[0];
        const ydata = oData[1];
        const width = oData[3];
        const height = oData[4];
        const altitude = oData[5];
        const rotate = oData[6];
        const material = oData[7];
        let shape = oData[8];
        const oColor = '#000000';
        // 0~3分別是矩型、三角形、圓形、梯形
        let text = `${this.translateService.instant('planning.obstacleInfo')}
        X: ${xdata}
        Y: ${ydata}
        ${this.translateService.instant('width')}: ${width}
        ${this.translateService.instant('height')}: ${height}
        ${this.translateService.instant('altitude')}: ${altitude}
        `;

        if (typeof material !== 'undefined') {
          text += `${this.translateService.instant('material')}: ${this.authService.parseMaterial(material)}`;
        }
        if (typeof shape === 'undefined') {
          shape = '0';
        }

        this.rectList.push({
          x: xdata,
          y: ydata,
          width: width,
          height: height,
          rotate: rotate,
          shape: shape,
          style: {
            left: 0,
            top: 0,
            width: width,
            height: height,
            zIndex: -1,
            // transform: `rotate(${oData[5]}deg)`,
            position: 'absolute',
            visibility: this.showObstacle,
            // fill: oColor,
            opacity: 0.3
          },
          svgStyle: {
            width: width,
            height: height,
            // fill: oColor,
            // opacity: 0.3
          },
          hover: text
        });
      }
      // console.log(this.rectList);
    }

    // const trace = {
    //   x: mapX,
    //   y: mapY,
    //   type: 'scatter',
    //   text: mapText,
    //   mode: 'markers',
    //   marker: {
    //     color: mapColor,
    //     symbol: 'square',
    //     size: 8
    //   },
    //   showlegend: false,
    //   hovertemplate: `X: %{x}<br>Y: %{y}<br>${this.translateService.instant('signalStrength')}: %{text}<extra></extra>`,
    // };
    // traces.push(trace);
    // let scalemax = Math.round(this.maxZ[zValues.indexOf(this.zValue)]);
    // let scalemin = Math.round(this.minZ[zValues.indexOf(this.zValue)]);
    // let unit = (scalemax-scalemin)/4;
    // let scaleunit = [scalemax, scalemax-unit, scalemax-2*unit, scalemax-3*unit, scalemin];
    // let scaleunitText = [`${scalemax}dB`, `${scalemax-unit}dB`, `${scalemax-2*unit}dB`, `${scalemax-3*unit}dB`, `${scalemin}dB`];

    // const trace = {
      // x: x,
      // y: y,
      // z: zData[zValues.indexOf(this.zValue)],
      // text: zText[zValues.indexOf(this.zValue)],
      // colorscale: 'Portland',
      // type: 'heatmap',
      // hovertemplate: `X: %{x}<br>Y: %{y}<br>${this.translateService.instant('signal.quality')}: %{text}dB<extra></extra>`,
      // showscale: false,
      // opacity: this.opacityValue,
      // zsmooth: 'fast',
      // zmin: scalemin,
      // zmax: scalemax,
      // colorbar: {
        // autotick: false,
        // tickvals: scaleunit,
        // ticksuffix: 'dB',
        // ticktext: scaleunitText,
        // ticklabelposition: 'inside bottom'
        // tick1: 24,
        // dtick: 7
      // }
    // };
    // traces.push(trace);

    // 現有基站
    // if (0) {
    if (this.calculateForm.defaultBs !== '')
    {
      let isDASFormat = (this.calculateForm.isSimulation &&
        this.calculateForm.bsList != null && this.calculateForm.bsList.defaultBs != null);

      let list = null;

      if (isDASFormat)
      {
        list = this.calculateForm.bsList.defaultBs;
      }
      else
      {
        list = this.calculateForm.defaultBs.split('|');
      }

      const cx = [];
      const cy = [];
      const ctext = [];
      let num = 1;      

      for (const item of list)
      {

        let oData;
        let antData = [];
        let xdata;
        let ydata;
        let zdata;

        if (isDASFormat)
        {
          oData = item.position;
          antData = item.antenna;
          xdata = Number(oData[0]);
          ydata = Number(oData[1]);
          zdata = Number(oData[2]);
        }
        else
        {
          oData = JSON.parse(item);
          xdata = oData[0];
          ydata = oData[1];
          zdata = oData[2];
        }

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
          color: '#000000',
          ap: `${this.translateService.instant('default')}${num}`,
          hover: text,
          style: {
            // visibility: this.showBs,
            visibility: 'hidden',
            opacity: 1
          },
          circleStyle: {
            // visibility: this.showBs
            visibility: 'hidden',
          }
        });

        for (let a = 1; a < antData.length; a++)
        {
          this.antList.push({
            x: Number(antData[a].position[0]),
            y: Number(antData[a].position[1]),
            color: '#000000',
            ap: `${this.translateService.instant('antenna')}${num}.${a + 1}`,
            style: {
              // visibility: this.showBs,
              visibility: 'hidden',
              opacity: 0
            },
            circleStyle: {
              // visibility: this.showBs
              visibility: 'hidden',
            }
          });
        }
        num++;
      }
      // traces.push({
      //   x: cx,
      //   y: cy,
      //   text: ctext,
      //   textfont: {
      //     color: '#fff'
      //   },
      //   type: 'scatter',
      //   mode: 'markers',
      //   marker: {
      //     size: 25,
      //     color: '#000'
      //   },
      //   hovertemplate: `X: %{x}<br>Y: %{y}<br>%{text}<extra></extra>`,
      //   showlegend: false,
      //   visible: this.showBs,
      //   uid: `BS`,
      //   opacity: 0
      // });
    }

    // 新增基站
    if (this.calculateForm.candidateBs !== '') {
      const list = this.calculateForm.candidateBs.split('|');
      const cx = [];
      const cy = [];
      const chosenCandidate = [];
      for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
        chosenCandidate.push(this.result['chosenCandidate'][i].toString());
      }
      let num = 1;

      const candidateX = [];
      const candidateY = [];
      const candidateText = [];
      const hoverText = [];
      for (const item of list) {
        const oData = JSON.parse(item);
        if (chosenCandidate.includes(oData.toString())) {
          const xdata = oData[0];
          const ydata = oData[1];
          const zdata = oData[2];
          cx.push(xdata);
          cy.push(ydata);

          const text = `${this.translateService.instant('candidateBs')}
          X: ${xdata}
          Y: ${ydata}
          Z: ${zdata}
          ${this.translateService.instant('bsPower')}: ${this.result['candidateBsPower'][chosenCandidate.indexOf(oData.toString())]} dBm`;
          this.candidateList.push({
            x: xdata,
            y: ydata,
            color: '#f7176a',
            hover: text,
            num: num,
            ap: `${this.translateService.instant('candidate')}${num}`
          });

          candidateX.push(xdata);
          candidateY.push(ydata);
          candidateText.push(`Z: ${zdata}<br>${this.translateService.instant('bsPower')}: ${this.result['candidateBsPower'][chosenCandidate.indexOf(oData.toString())]} dBm`);
          hoverText.push(text);
        }
        num++;
      }

      traces.push({
        x: candidateX,
        y: candidateY,
        text: candidateText,
        textfont: {
          color: '#fff'
        },
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 25,
          color: '#000'
        },
        hovertemplate: `X: %{x}<br>Y: %{y}<br>%{text}<extra></extra>`,
        showlegend: false,
        visible: this.showCandidate,
        uid: `AP`,
        opacity: 0
      });
    }

    console.log(traces);

    Plotly.newPlot(id, {
      // data: {},
      data: traces,
      layout: layout,
      config: defaultPlotlyConfiguration
    }).then((gd) => {
      
      const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
      const rect = xy.getBoundingClientRect();
      let layoutOption = {};
      
      this.annotations.length = 0;
      // 新增基站
      if (this.calculateForm.candidateBs !== '' || this.calculateForm.defaultBs !== '') {
        const xLinear = Plotly.d3.scale.linear()
        .domain([0, rect.width])
        .range([0, this.calculateForm.width]);

        const yLinear = Plotly.d3.scale.linear()
          .domain([0, rect.height])
          .range([0, this.calculateForm.height]);
        
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
            text: item.ap,
            showarrow: false,
            font: {
              color: '#fff',
              size: 10
            },
            visible: this.showCandidate
          });
        }

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
            visible: this.showBs,
            layer: "above"
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
            visible: this.showBs,
            layer: "above"
          });
        }
        for (const item of this.antList)
        {
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
              size: 8
            },
            visible: this.showBs
          });
        }
      }
      // 場域尺寸計算
      const leftArea = <HTMLDivElement> document.querySelector('.leftArea');
      this.chartService.calResultSize(this.calculateForm, gd, leftArea.clientWidth - this.chartService.leftSpace).then(res => {
        layoutOption = {
          width: res[0],
          height: res[1],
          shapes: this.shapes,
          annotations: this.annotations
        };
        // resize layout
        this.reLayout(id, layoutOption, isPDF);
      });      

    });

    // id.on('plotly_relayout',
    // (eventdata) => {
    //   let x_start = eventdata['xaxis.range[0]'];
    //   let x_end = eventdata['xaxis.range[1]'];
    //   let y_start = eventdata['yaxis.range[0]'];
    //   let y_end = eventdata['yaxis.range[1]'];
    //   if (x_start != undefined && x_end != undefined && y_start != undefined && y_end != undefined) {
    //     console.log(`${x_start} ${x_end} ${y_start} ${y_end}`);
    //     console.log(zData);
    //   }
    // });
  }

  /**
   * 畫好圖後重新計算比例尺
   * @param id 
   * @param layoutOption 
   * @param isPDF 
   */
  reLayout(id, layoutOption, isPDF) {
    Plotly.relayout(id, layoutOption).then((gd2) => {

      this.setChartObjectSize(gd2);

      if (isPDF) {
        // pdf轉成png，避免colorbar空白
        this.showImg = true;
        // const gd2Rect = gd2.getBoundingClientRect();
        // Plotly.toImage(gd2, {width: gd2Rect.width, height: gd2Rect.height}).then(dataUri => {
        Plotly.toImage(gd2, {width: layoutOption.width, height: layoutOption.height}).then(dataUri => {
          this.imageSRC = dataUri;
          Plotly.d3.select(gd2.querySelector('.plotly')).remove();
          this.style['z-index'] = 0;
          this.style['opacity'] = 1;
          this.divStyle['text-align'] = 'left';
          this.drawDown = true;
          console.log('site-planning-map to image done.');
          // for (const item of this.rectList) {
          //   item.color = item['svgStyle'].fill = 'rgba(0, 0, 0, 0)';
          // }
        });

      }
    });
  }

  setChartObjectSize(gd2) {

    this.divStyle.opacity = 1;
    const xy2: SVGRectElement = gd2.querySelector('.draglayer > .xy').querySelectorAll('rect')[0];
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

      item['style'].top = `${rect2.height - height - pixelYLinear(item.y)}px`;
      item['style'].left = `${leftPosition}px`;
      item['style'].width = `${width}px`;
      item['style'].height = `${height}px`;
      item['svgStyle'].width = `${width}px`;
      item['svgStyle'].height = `${height}px`;
      if (item.shape === 1) {
        const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
        item['points'] = points;
        // console.log(item);
      } else if (item.shape === 2) {
        item['ellipseStyle'] = {
          cx: width / 2,
          cy: width / 2,
          rx: width / 2,
          ry: width / 2
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
        position: 'absolute',
        // visibility: this.showBs
      };
      item['circleStyle'] = {
        left: `${pixelXLinear(item.x) + 15}px`,
        bottom: `${pixelYLinear(item.y) + 25}px`,
        position: 'absolute',
        // visibility: this.showBs
      };
    }

    for (const item of this.antList)
    {
      item['style'] = {
        left: `${pixelXLinear(item.x)}px`,
        bottom: `${pixelYLinear(item.y)}px`,
        position: 'absolute',
        // visibility: this.showBs
      };
      item['circleStyle'] = {
        left: `${pixelXLinear(item.x) + 15}px`,
        bottom: `${pixelYLinear(item.y) + 25}px`,
        position: 'absolute',
        // visibility: this.showBs
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
        left: `${pixelXLinear(item.x)}px`,
        bottom: `${candisateYLinear(item.y)}px`,
        position: 'absolute',
        visibility: this.showCandidate
      };
      item['circleStyle'] = {
        left: `${pixelXLinear(item.x) + 15}px`,
        bottom: `${candisateYLinear(item.y) + 25}px`,
        position: 'absolute',
        visibility: this.showCandidate
      };
    }
  }

}
