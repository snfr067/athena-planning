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
  /** 天線 list */
  antList = [];
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
  /** 顯示圖轉換的image */
  showImg = false;
  /** 圖轉換的image src */
  imageSRC = '';
  /** 覆蓋率計算方式 */
  coverageCalculateFunction = 'default';
  sinrTh = 0;
  rsrpTh = 0;

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
    this.antList.length = 0;
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
    var CooUnit = this.calculateForm.resolution;
    // if (this.calculateForm.width > 200 || this.calculateForm.height > 200){
    //   CooUnit = 2;
    // }
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
      let list = null;
      let isDASFormat = (this.calculateForm.isSimulation &&
        this.calculateForm.bsList != null && this.calculateForm.bsList.defaultBs != null);

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
      for (const item of list) {
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
        defaultBs.push(oData);
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

        for (let a = 0; a < antData.length; a++)
        {
          this.antList.push({
            x: Number(antData[a].position[0]),
            y: Number(antData[a].position[1]),
            color: item.color[1],
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
    console.log(this.result);
    /*for (const item of this.result['connectionMap']) {
      for (let i = 0; i < zLen; i++) {
        // console.log(item)
        let yIndex = 0;
        for (const yData of item) {
        // console.log(yData)
          // if (CooUnit == 2){
          //     if ((yIndex >= this.calculateForm.height/2 || xIndex >= this.calculateForm.width/2)){
          //       continue;
          //     }
          // }
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
    }*/

    let coverageSum = 0;
    let allPosition = 0;

    console.log(`${this.rsrpTh}/${this.sinrTh}`);

    for (let con = 0; con < this.result['connectionMap'].length; con++)
    {
      for (let i = 0; i < zLen; i++)
      {
        // console.log(item)
        let isCoverage = false;
        let yIndex = 0;
        for (const yData of this.result['connectionMap'][con])
        {
          if (typeof zData[i][yIndex] == 'undefined')
          {
            zData[i][yIndex] = [];
            zText[i][yIndex] = [];
          }

          if (this.coverageCalculateFunction == 'default')
          {
            isCoverage = true;
          }
          else if (this.coverageCalculateFunction == 'rsrp')
          {
            if (this.result['rsrpMap'][xIndex][yIndex][i] >= this.rsrpTh)
            {
              isCoverage = true;
            }
          }
          else if (this.coverageCalculateFunction == 'sinr')
          {
            if (this.result['sinrMap'][xIndex][yIndex][i] >= this.sinrTh)
            {
              isCoverage = true;
            }
          }
          if (isCoverage)
          {
            zData[i][yIndex][xIndex] = yData[i];
            zText[i][yIndex][xIndex] = yData[i];

            coverageSum++;
          }
          else
          {
            zData[i][yIndex][xIndex] = null;
            zText[i][yIndex][xIndex] = null;
          }
          allPosition++;
          yIndex++;
          if (!allZ[i].includes(yData[i]) && yData[i] != null)
          {
            allZ[i].push(yData[i]);
          }
        }
      }
      xIndex++;
    }

    console.log(`cover Ratio = ${coverageSum}/${allPosition} = ${coverageSum / allPosition}`);

    // 取z的最大值
    const zMax = [];
    const zMin = [];
    for (const item of allZ) {
      item.sort();
      zMax.push(Plotly.d3.max(item));
      zMin.push(Plotly.d3.min(item));
    }
    console.log(zMax, zMin)

    console.log(`distinct connectionMap data`, allZ[zValues.indexOf(Number(this.zValue))]);

    const x = [];
    const y = [];
    let xval = CooUnit/2;
    while(xval - CooUnit/2 < this.calculateForm.width){
      x.push(xval);
      xval += CooUnit;
    }
    let yval = CooUnit/2;
    while(yval - CooUnit/2 < this.calculateForm.height){
      y.push(yval);
      yval += CooUnit;
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
      let list;
      let listLen = 0;

      if (this.calculateForm.candidateBs != "") {
        list = this.calculateForm.candidateBs.split('|');
        listLen = list.length;
        const cx = [];
        const cy = [];

        for (let j = 0; j < list.length; j++) {
          const oData = JSON.parse(list[j]);
          // legend編號有包含在connectionMap裡
          if (allZ[zValues.indexOf(Number(this.zValue))].includes(j)) {
            cx.push(oData[0]);
            cy.push(oData[1]);

            // const z = zData[zValues.indexOf(Number(this.zValue))][Math.floor(oData[1])][Math.floor(oData[0])];
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
              color = colorFN(j);
            }

            // legend編號有在connectionMap裡的才呈現
            // console.log('hahaha');
            if (allZ[zValues.indexOf(Number(this.zValue))].includes(legendNum)) {
            // console.log('hehehe');
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
              apMap[j] = `${this.translateService.instant('result.propose.candidateBs')} ${(j + 1)}`;

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
      console.log(JSON.stringify(apMap));

      const defaultBsLen = defaultBs.length;
      if (defaultBsLen > 0) {
        const defaultBsAry = [];
        const mapData = allZ[zValues.indexOf(Number(this.zValue))];

        for (let i = 0; i < defaultBsLen; i++) {
          const useNum = legendNum + i;
          
          if (!mapData.includes(useNum)) {
            continue;
          }

          const max = zMax[zValues.indexOf(Number(this.zValue))];
          const min = zMin[zValues.indexOf(Number(this.zValue))];
          // Xean: 07/10 add legend color改用計算的
          let color;
          if (allZero) {
            // 都是0的基站指定為藍色
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
            console.log(useNum);
            color = colorFN(useNum);
          }

          // legend編號
          this.traces.push({
            x: [0],
            y: [0],
            name: `${this.translateService.instant('defaultBs')} ${(i + 1)}`,
            marker: {
              color: color,
            },
            type: 'bar',
            hoverinfo: 'none',
            showlegend: true
          });

          apMap[useNum] = `${this.translateService.instant('defaultBs')} ${(i + 1)}`;
          // legendNum++;
        }

        
        for (let i = 0; i < mapData.length; i++) {
          
        }
      }
      
      console.log(`apMap`, apMap);

      // 重新指定連線對象tooltip
      xIndex = 0;

      for (let con = 0; con < this.result['connectionMap'].length; con++)
      {
        for (let i = 0; i < zLen; i++)
        {
          // console.log(item)
          let isCoverage = false;
          let yIndex = 0;
          for (const yData of this.result['connectionMap'][con])
          {
            if (typeof zData[i][yIndex] == 'undefined')
            {
              zData[i][yIndex] = [];
              zText[i][yIndex] = [];
            }

            if (this.coverageCalculateFunction == 'default')
            {
              isCoverage = true;
            }
            else if (this.coverageCalculateFunction == 'rsrp')
            {
              if (this.result['rsrpMap'][xIndex][yIndex][i] >= this.rsrpTh)
              {
                isCoverage = true;
              }
            }
            else if (this.coverageCalculateFunction == 'sinr')
            {
              if (this.result['sinrMap'][xIndex][yIndex][i] >= this.sinrTh)
              {
                isCoverage = true;
              }
            }
            if (isCoverage && typeof apMap[yData[i]] != 'undefined')
            {
              zText[i][yIndex][xIndex] = apMap[yData[i]];              
            }
            else
            {
              zText[i][yIndex][xIndex] = '無';
            }
            allPosition++;
            yIndex++;
            if (!allZ[i].includes(yData[i]) && yData[i] != null)
            {
              allZ[i].push(yData[i]);
            }
          }
        }
        xIndex++;
      }

      /*for (const item of this.result['connectionMap']) {
        for (let i = 0; i < zLen; i++) {
          let yIndex = 0;
          for (const yData of item) {
            // console.log(yData)
            // if (CooUnit == 2){
            //   if ((yIndex >= this.calculateForm.height/2 || xIndex >= this.calculateForm.width/2)){
            //     continue;
            //   }
            // }
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
      }*/
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
        const width = oData[3];
        const height = oData[4];
        const altitude = oData[5];
        const rotate = oData[6];
        const material = oData[7];
        // 0~3分別是矩型、三角形、圓形、梯形
        let shape = oData[8];
        const oColor = '#000000';
        
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
            // transform: `rotate(${oData[5]}deg)`,
            position: 'absolute',
            visibility: this.showObstacle,
            opacity: 0
          },
          svgStyle: {
            width: width,
            height: height,
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
            text: item.ap.replace(this.translateService.instant('result.propose.candidateBs'), 'BS'),
            showarrow: false,
            font: {
              color: '#fff',
              size: 10
            },
            visible: this.showCandidate
          });
        }

        /*有了天線就不顯示"既有基站"
        /*for (const item of this.defaultBsList) {
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
        }*/

        for (const item of this.antList)
        {
          this.shapes.push({
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: item.x,
            y0: item.y,
            x1: item.x + Number(xLinear(70)),
            y1: item.y + Number(yLinear(18)),
            fillcolor: item.color,
            bordercolor: item.color,
            visible: this.showBs
          });

          this.annotations.push({
            x: item.x + Number(xLinear(35)),
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
        if (images.length > 0) {
          const image = new Image();
          image.src = images[0].source;
          image.onload = () => {
            this.reLayout(id, layoutOption, isPDF);
          };
          
        } else {
          this.reLayout(id, layoutOption, isPDF);
        }
      });    

      
    });
  }

  /**
   * 畫好圖後重新計算比例尺
   * @param id 
   * @param layoutOption 
   */
  reLayout(id, layoutOption, isPDF) {
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
        // console.log(item)
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
          console.log(item, points);
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
          position: 'absolute'
        };
        item['circleStyle'] = {
          left: `${pixelXLinear(item.x) + 15}px`,
          bottom: `${pixelYLinear(item.y) + 25}px`,
          position: 'absolute'
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

      if (isPDF) {
        // pdf轉成png，避免colorbar空白
        this.showImg = true;
        Plotly.toImage(gd2, {width: layoutOption.width, height: layoutOption.height}).then(dataUri => {
          this.imageSRC = dataUri;
          Plotly.d3.select(gd2.querySelector('.plotly')).remove();
          this.style['z-index'] = 0;
          this.style['opacity'] = 0.2;
          this.divStyle['text-align'] = 'left';
          for (const item of this.rectList) {
            item.color = item['svgStyle'].fill = 'rgba(0, 0, 0, 0.2)';
          }
        });
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

  switchShowAnt(visible)
  {

    if (visible == 'visible') { visible = true; } else { visible = false; }

    for (const item of this.shapes)
    {
      // 顏色區分障礙物與BS
      if (item.type == 'circle' && item.fillcolor === '#3C0000')
      {
        item.visible = visible;
      }
    }
    for (const item of this.annotations)
    {
      console.log(JSON.stringify(item));
      if (item.text[0] == '天' || item.text[0] == 'A')
      {
        item.visible = visible;
      }
    }

    Plotly.relayout(this.chartId, {
      shapes: this.shapes,
      annotations: this.annotations
    });

    // for (const item of this.defaultBsList) {
    //   item.style['visibility'] = visible;
    //   item.circleStyle['visibility'] = visible;
    // }
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
