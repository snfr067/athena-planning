import { Component, OnInit, Input, ViewChild, ElementRef, ViewChildren,QueryList, HostListener } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { ChartService } from '../../../service/chart.service';

declare var Plotly: any;

@Component({
  selector: 'app-sub-field',
  templateUrl: './sub-field.component.html',
  styleUrls: ['./sub-field.component.scss']
})
export class SubFieldComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private translateService: TranslateService,
    private chartService: ChartService
  ) { }

  /** 圖layout */
  plotLayout;
  /** result output */
  result = {};
  /** result input */
  calculateForm = new CalculateForm();
  /** 障礙物list */
  rectList = [];
  /** 子場域list */
  // subFieldList = {};
  subFieldList = [];
  /** 建議方案 list */
  candidateList = [];
  /** 既有基站 list */
  defaultBsList = [];
  /** 是否PDF頁面 */
  isPDF = false;
  zNumber = 1;
  rsrpTh;

  shapes = [];
  annotations = [];
  chartId;
  /** 圖element */
  @ViewChild('layoutChart') layoutChart: ElementRef;
  /** table element */
  @ViewChild('subFieldTbody') subFieldTbody: ElementRef<HTMLElement>;
  /** image element */
  @ViewChild('proposeImg') proposeImg: ElementRef<HTMLImageElement>;
  @ViewChildren('obstaclecElm') obstacleElm: QueryList<ElementRef>;

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
        this.reLayout(this.chartId, layoutOption);
      });
      // this.reLayout(this.chartId, layoutOption);
    });
  }

  ngOnInit(): void {
  }

  /**
   * draw layout
   * @param isPDF 
   */
  drawLayout(isPDF) {
    this.rectList.length = 0;
    this.defaultBsList.length = 0;
    this.layoutChart.nativeElement.style.opacity = 0;
    const images = [];
    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.authService.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {
        // background image chart
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

        this.draw(isPDF, images);
      };
    } else {
      this.draw(isPDF, images);
    }
  }

  /**
   * 計算子場域的
   * 覆蓋率
   * 訊號品質
   * 上行傳輸速率
   * 下行傳輸速率
   */
  calSubFieldSignalValue(type,z) {
    // calSubFieldSignalValue(type, x, y, width, height, z) {
    // console.log(this.calculateForm);
    // console.log(this.result);
    let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
    let covTh = 0;
    if (this.calculateForm.mapProtocol == '5g') {
      covTh = -1.889;
    } else if (this.calculateForm.mapProtocol == '4g') {
      covTh = -7;
    } else {
      covTh = 1;
    }
    let zResult;
    let valueArr;
    let totalValue = 0, tempSinrValue = 0;
    let points = 0;

    if (type === 'quality') {
      valueArr = this.result['sinrMap'];
    } else if (type === 'coverage') {
      valueArr = this.result['connectionMap'];
      tempSinrValue = this.result['sinrMap'];
    } else if (type === 'coverageRsrp') {
      valueArr = this.result['connectionMap'];
      tempSinrValue = this.result['rsrpMap'];
    } else if (type === 'rsrp') {
      valueArr = this.result['rsrpMap'];
    } else if (type === 'dltpt') {
      valueArr = this.result['throughputMap'];
    } else {
      valueArr = this.result['ulThroughputMap'];
    }
    var CooUnit = this.calculateForm.resolution;
    for (let i = 0;i < sub_field_arr.length;i++) {
      let x_start = Math.floor(Number(sub_field_arr[i].x));
      let x_end = Math.ceil(Number(sub_field_arr[i].x)+Number(sub_field_arr[i].width));
      let y_start = Math.floor(Number(sub_field_arr[i].y));
      let y_end = Math.ceil(Number(sub_field_arr[i].y)+Number(sub_field_arr[i].height));
      // 我只是想放N/A: (當x_start < x_end) ,y亦然
      if ((x_start == Math.floor(this.calculateForm.width) || y_start == Math.floor(this.calculateForm.height))){
        if (type === 'coverage' || type === 'coverageRsrp') {
          zResult = 0/0; // N/A
        } else {
          zResult = 0/0; // N/A
        }
      } else {
        if (x_end > Math.floor(this.calculateForm.width)) {
          x_end = x_end - 1;
        }
        if (y_end > Math.floor(this.calculateForm.height)) {
          y_end = y_end - 1;
        }
        for (let i = Math.floor(x_start/CooUnit);i < Math.ceil(x_end/CooUnit);i++) {
          for (let j = Math.floor(y_start/CooUnit);j < Math.ceil(y_end/CooUnit);j++) {
            // console.log(`${i} ${j} ${valueArr[i][j][0]}`);
            if (type === 'coverage') {
              if (Number(tempSinrValue[i][j][z]) > covTh) {
                totalValue+=1;
              } else {
                // console.log(Number(tempSinrValue[i][j][z])+" "+covTh);
              }
            } else if (type === 'coverageRsrp') {
              this.rsrpTh = Number(sessionStorage.getItem('rsrpThreshold'));
              if (Number(tempSinrValue[i][j][z]) > Number(sessionStorage.getItem('rsrpThreshold'))) {
                totalValue+=1;
              }
            } else {
              totalValue += Number(valueArr[i][j][z]);
            }
            points++;
          }
        }
        
      }
    }
    // console.log("points",points);
    if (type === 'coverage') {
      zResult = this.financial(Number(totalValue/points)*100, 2);
    } else if (type === 'coverageRsrp') {
      zResult = this.financial(Number(totalValue/points)*100, 2);
    } else {
      zResult = this.financial(totalValue/points, 2);
    }
    
    return zResult;
  }

  financial(x,point) {
    if (point == 1) {
      return Number.parseFloat(x).toFixed(1);
    } else {
      return Number.parseFloat(x).toFixed(2);
    }
  }

  findSubFieldFontSize (width, height) {
    let lower = (Number(width) <= Number(height)) ? Number(width): Number(height);
    if (lower == Number(width)) {
      return `${lower / this.calculateForm.width * 300}px`;
    } else {
      return `${lower / this.calculateForm.height * 300}px`;
    }
  }

  /**
   * 畫圖
   * @param isPDF 
   * @param images 
   */
  draw(isPDF, images) {
    const defaultPlotlyConfiguration = {
      displaylogo: false,
      showTips: false,
      editable: false,
      scrollZoom: false,
      displayModeBar: false
    };

    this.plotLayout = {
      autosize: true,
      xaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.width],
        showgrid: false,
        zeroline: false,
        fixedrange: true
      },
      yaxis: {
        linewidth: 1,
        mirror: 'all',
        range: [0, this.calculateForm.height],
        showgrid: false,
        zeroline: false,
        fixedrange: true
      },
      margin: { t: 20, b: 20, l: 50, r: 50},
      images: images,
      hovermode: 'closest'
    };

    let id;
    if (isPDF) {
      id = document.querySelector('#pdf_area').querySelector('#layout_chart2');
    } else {
      id = document.querySelector('#layout_chart2');
    }
    this.chartId = id;

    // 子場域
    if (sessionStorage.getItem('sub_field_coor') != null) {
      this.rectList = JSON.parse(sessionStorage.getItem('sub_field_coor'));
      this.rectList.forEach(el => {
        el.style = {
          left: 0,
          top: 0,
          fs: this.findSubFieldFontSize(el.width, el.height),
          width: el.width,
          height: el.height,
          position: 'absolute',
          opacity: 1
        }
        el.svgStyle= {
          width: el.width,
          height: el.height,
          fill: 'pink',
          fillOpacity:0.2,
          stroke:'pink',
          strokeWidth: 3,
        }
      });
    }
    
    

    // candidateBs
    let index = 1;
    const numMap = {};
    const xyMap = {};
    const x = [];
    const y = [];
    const text = [];
    const color = [];

    if (!this.authService.isEmpty(this.calculateForm.candidateBs)) {
      const candidateBs = this.calculateForm.candidateBs.split('|');
      for (let i = 0; i < candidateBs.length; i++) {
        const candidate = JSON.parse(candidateBs[i]);
        numMap[candidate] = index;
        xyMap[candidate] = {
          x: candidate[0],
          y: candidate[1]
        };
        x.push(candidate[0]);
        y.push(candidate[1]);
        text.push(index);
        color.push('#7083d6');
        index++;
      }
    }

    const traces = [];
    const chosenNum = [];
    // 子場域
    let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
    let zValue = JSON.parse(this.calculateForm.zValue);
    this.zNumber = zValue.length;
    console.log(sub_field_arr);
    if (sub_field_arr != null) {
      // sub_field_arr.forEach(el => {
        // let ueList = this.calculateForm.ueCoordinate.split('|');
        // let defaultBsList = this.calculateForm.defaultBs.split('|');
        // let candidateList = this.result['chosenCandidate'];
        // ueList.filter(ue => (JSON.parse(ue)[0] < (el.x + el.width) && JSON.parse(ue)[1] < (el.y + el.height)));
        // defaultBsList.filter(bs => (JSON.parse(bs)[0] < (el.x + el.width) && JSON.parse(bs)[1] < (el.y + el.height)));
        // candidateList.filter(bs => (JSON.parse(bs)[0] < (el.x + el.width) && JSON.parse(bs)[1] < (el.y + el.height)));

        // console.log(ueList);
        // console.log(defaultBsList);
        // console.log(candidateList);
        for(let z = 0;z < zValue.length;z++) {
          this.subFieldList.push({
            // x: this.financial(el.x,1),
            // y: this.financial(el.y,1),
            z: zValue[z],
            // width: el.width,
            // height: el.height,
            // area: Math.round(Number(el.width)*Number(el.height)),
            coverage: this.calSubFieldSignalValue('coverage',z),
            quality: this.calSubFieldSignalValue('quality',z),
            coverageRsrp: this.calSubFieldSignalValue('coverageRsrp',z),
            rsrp: this.calSubFieldSignalValue('rsrp',z),
            dltpt: this.calSubFieldSignalValue('dltpt',z),
            ultpt: this.calSubFieldSignalValue('ulptp',z),
            // coverage: this.calSubFieldSignalValue('coverage',Number(el.x),Number(el.y),Number(el.width),Number(el.height),z),
            // quality: this.calSubFieldSignalValue('quality',Number(el.x),Number(el.y),Number(el.width),Number(el.height),z),
            // rsrp: this.calSubFieldSignalValue('rsrp',Number(el.x),Number(el.y),Number(el.width),Number(el.height),z),
            // dltpt: this.calSubFieldSignalValue('dltpt',Number(el.x),Number(el.y),Number(el.width),Number(el.height),z),
            // ultpt: this.calSubFieldSignalValue('ulptp',Number(el.x),Number(el.y),Number(el.width),Number(el.height),z),
            ueNum: 0,
            defaultBsNum: 0,
            candidateBsNum: 0
          });
        // }
      }
    }

    if (this.calculateForm.ueCoordinate !== '') {
      const list = this.calculateForm.ueCoordinate.split('|');
      const cx = [];
      const cy = [];
      const text = [];

      for (const item of list) {
        const oData = JSON.parse(item);
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
        visible: true
      });
    }

    if (this.calculateForm.defaultBs !== '') {
      const list = this.calculateForm.defaultBs.split('|');
      const cx = [];
      const cy = [];
      const ctext = [];
      let num = 1;

      for (const item of list) {
        const oData = JSON.parse(item);
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
          color: '#000000',
          ap: `${this.translateService.instant('default')}${num}`,
          hover: text,
          style: {
            visibility: 'hidden',
            opacity: 0
          },
          circleStyle: {
            visibility: 'hidden',
          }
        });
        num++;
      }
    }
    
    // 建議方案 list
    this.candidateList.length = 0;
    for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
      if (typeof numMap[this.result['chosenCandidate'][i].toString()] !== 'undefined') {
        this.candidateList.push([
          numMap[this.result['chosenCandidate'][i].toString()],
          xyMap[this.result['chosenCandidate'][i].toString()].x,
          xyMap[this.result['chosenCandidate'][i].toString()].y,
          this.result['candidateBsPower'][i],
          this.result['candidateBeamId'][i]
        ]);
        color[numMap[this.result['chosenCandidate'][i]] - 1] = 'red';
        chosenNum.push(numMap[this.result['chosenCandidate'][i].toString()]);

        traces.push({
          type: 'scatter',
          mode: 'text',
          x: [xyMap[this.result['chosenCandidate'][i].toString()].x],
          y: [xyMap[this.result['chosenCandidate'][i].toString()].y],
          text: `${numMap[this.result['chosenCandidate'][i].toString()]}<br>✅`,
          marker: {
            size: 27,
            color: color,
            symbol: 'arrow-bar-down-open'
          },
          textfont: {
            size: 14,
            color: 'red'
          },
          hoverinfo: 'x+y',
          showlegend: false
        });
      }
    }

    for (let i = 0; i < x.length; i++) {
      if (!chosenNum.includes((i + 1))) {
        traces.push({
          type: 'scatter',
          mode: 'markers+text',
          x: [x[i]],
          y: [y[i]],
          text: text[i],
          marker: {
            size: 20,
            color: 'gray',
            symbol: 'x'
          },
          textfont: {
            size: 14,
            color: 'red'
          },
          textposition: 'center top',
          hoverinfo: 'x+y',
          showlegend: false
        });
      }
    }

    if (id != null) {
      Plotly.newPlot(id, {
        data: traces,
        layout: this.plotLayout,
        config: defaultPlotlyConfiguration
      }).then((gd) => {

        this.shapes.length = 0;
        this.annotations.length = 0;
        const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
        const rect = xy.getBoundingClientRect();
        const xLinear = Plotly.d3.scale.linear()
          .domain([0, rect.width])
          .range([0, this.calculateForm.width]);

          const yLinear = Plotly.d3.scale.linear()
          .domain([0, rect.height])
          .range([0, this.calculateForm.height]);

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
              visible: true
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
              visible: true
            });
          }

        // 場域尺寸計算
        const leftArea = <HTMLDivElement> document.querySelector('.leftArea');
        this.chartService.calResultSize(this.calculateForm, gd, leftArea.clientWidth - this.chartService.leftSpace).then(res => {
          const layoutOption = {
            width: res[0],
            height: res[1],
            shapes: this.shapes,
            annotations: this.annotations
          };

          
          // resize layout
          Plotly.relayout(id, layoutOption).then((gd2) => {
            this.layoutChart.nativeElement.style.opacity = 1;
            const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
            const rect2 = xy2.getBoundingClientRect();
            gd2.style.opacity = 0.85;
            gd2.querySelectorAll('.plotly')[0].style.opacity = 0.85;
            const pixelXLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.width])
              .range([0, rect2.width]);
            const pixelYLinear = Plotly.d3.scale.linear()
              .domain([0, this.calculateForm.height])
              .range([0, rect2.height]);
            for (const item of this.rectList) {
              let width = pixelXLinear(item.width);
              let height = pixelYLinear(item.height);
              const leftPosition = pixelXLinear(item.x);
              item['style'].top = `${rect2.height - height - pixelYLinear(item.y)}px`;
              item['style'].left = `${leftPosition}px`;
              item['style'].width = `${width}px`;
              item['style'].height = `${height}px`;
              item['svgStyle'].width = `${width}px`;
              item['svgStyle'].height = `${height}px`;
              window.setTimeout(() => {
                item['style']['transform'] = `rotate(${item.rotate}deg)`;
                item['style'].opacity = 1;
              }, 0);
            }
          });
        });
      });
    }
    
    
  }

  reLayout(id, layoutOption) {
    Plotly.relayout(id, layoutOption).then((gd2) => {
      // this.divStyle.opacity = 1;
      const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
      const rect2 = xy2.getBoundingClientRect();
      gd2.style.opacity = 0.85;
      gd2.querySelectorAll('.plotly')[0].style.opacity = 0.85;
      const pixelXLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.width])
        .range([0, rect2.width]);
      const pixelYLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.height])
        .range([0, rect2.height]);
      for (const item of this.rectList) {
        let width = pixelXLinear(item.width);
        let height = pixelYLinear(item.height);
        const leftPosition = pixelXLinear(item.x);
        item['style'].top = `${rect2.height - height - pixelYLinear(item.y)}px`;
        item['style'].left = `${leftPosition}px`;
        item['style'].width = `${width}px`;
        item['style'].height = `${height}px`;
        item['svgStyle'].width = `${width}px`;
        item['svgStyle'].height = `${height}px`;
        // if (item.shape === 1) {
        //   const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
        //   item['points'] = points;
        //   console.log(item, points);
        // }
        // window.setTimeout(() => {
        //   item['style']['transform'] = `rotate(${item.rotate}deg)`;
        //   item['style'].opacity = 1;
        // }, 0);
      }

    });
  }

  /**
   * replace i18n文字內容
   */
  getWaitSelect() {
    return this.translateService.instant('result.propose.wait_select_2')
    .replace('{0}', this.candidateList.length);
  }

  /**
   * 將圖轉為image，pdf才不會空白
   */
  async toImg() {
    const proposeData = <HTMLDivElement> document.querySelector(`#propose`);
    await html2canvas(proposeData, {
      useCORS: true,
      // allowTaint: true,
    }).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png');
      this.proposeImg.nativeElement.src = contentDataURL;
      
      this.subFieldTbody.nativeElement.style.display = 'none';
      console.log('propose dom to img');
    });
  }

}
