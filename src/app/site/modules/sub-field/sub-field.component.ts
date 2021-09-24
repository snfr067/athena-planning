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
  subFieldList = [];
  /** 建議方案 list */
  candidateList = [];
  /** 既有基站 list */
  // defaultBsList = [];
  /** 是否PDF頁面 */
  isPDF = false;

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
    Plotly.relayout('layout_chart2', {
      width: maxWidth
    }).then(gd => {
      const sizes = this.chartService.calResultSize(this.calculateForm, gd, maxWidth);
      const layoutOption = {
        width: sizes[0],
        height: sizes[1]
      };
      Plotly.relayout('layout_chart2', layoutOption);
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
  calSubFieldSignalValue(type, x, y, width, height) {
    // console.log(this.calculateForm);
    // console.log(this.result);
    let x_start = Math.ceil(x);
    let x_end = Math.floor(x+width);
    let y_start = Math.ceil(y);
    let y_end = Math.floor(y+height);
    let x_range = x_end - x_start;
    let y_range = y_end - y_start;
    let area = x_range*y_range;
    console.log(`${x_start} ${x_end} ${y_start} ${y_end} ${area}`);
    let zValue = JSON.parse(this.calculateForm.zValue);
    let zResult = [];
    let valueArr;
    let totalValue = 0;
    if (type === 'quality') {
      valueArr = this.result['sinrMap'];
    } else if (type === 'coverage') {
      valueArr = this.result['connectionMap'];
    } else if (type === 'dltpt') {
      valueArr = this.result['throughputMap'];
    } else {
      valueArr = this.result['ulThroughputMap'];
    }
    for(let z = 0;z < zValue.length;z++) {
      totalValue = 0;
      for (let i = x_start;i < x_end;i++) {
        for (let j = y_start;j < y_end;j++) {
          // console.log(`${i} ${j} ${valueArr[i][j][0]}`);
          if (type === 'coverage') {
            if (valueArr[i][j][z] != null) {
              totalValue+=1;
            }
          } else {
            totalValue += Number(valueArr[i][j][z]);
          }
        }
      }
      console.log(totalValue);
      if (type === 'coverage') {
        zResult.push(100*Number(this.financial(totalValue/area)));
      } else {
        zResult.push(this.financial(totalValue/area));
      }
    }
    
    return JSON.stringify(zResult);
  }

  financial(x) {
    return Number.parseFloat(x).toFixed(2);
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

    // 子場域
    if (sessionStorage.getItem('sub_field_coor') != null) {
      this.rectList = JSON.parse(sessionStorage.getItem('sub_field_coor'));
      this.rectList.forEach(el => {
        el.style = {
          left: 0,
          top: 0,
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
    console.log(sub_field_arr);
    if (sub_field_arr != null) {
      sub_field_arr.forEach(el => {
        this.subFieldList.push({
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          area: Math.round(Number(el.width)*Number(el.height)),
          coverage: this.calSubFieldSignalValue('coverage',Number(el.x),Number(el.y),Number(el.width),Number(el.height)),
          quality: this.calSubFieldSignalValue('quality',Number(el.x),Number(el.y),Number(el.width),Number(el.height)),
          dltpt: this.calSubFieldSignalValue('dltpt',Number(el.x),Number(el.y),Number(el.width),Number(el.height)),
          ultpt: this.calSubFieldSignalValue('ulptp',Number(el.x),Number(el.y),Number(el.width),Number(el.height))
        });
      })
    }
    // 障礙物
    // if (this.calculateForm.obstacleInfo !== '') {
    //   const obstacle = this.calculateForm.obstacleInfo.split('|');
    //   for (const item of obstacle) {
    //     const oData = JSON.parse(item);
    //     const xdata = oData[0];
    //     const ydata = oData[1];
    //     const oColor = '#000000';
    //     // 0~3分別是矩型、三角形、圓形、梯形
    //     let shape = oData[7];
    //     let text = `${this.translateService.instant('planning.obstacleInfo')}
    //     X: ${xdata}
    //     Y: ${ydata}
    //     ${this.translateService.instant('width')}: ${oData[2]}
    //     ${this.translateService.instant('height')}: ${oData[3]}
    //     ${this.translateService.instant('altitude')}: ${oData[4]}
    //     `;

    //     if (typeof oData[6] !== 'undefined') {
    //       text += `${this.translateService.instant('material')}: ${this.authService.parseMaterial(oData[6])}`;
    //     }
    //     if (typeof oData[7] === 'undefined') {
    //       shape = '0';
    //     }

    //     this.rectList.push({
    //       x: xdata,
    //       y: ydata,
    //       width: oData[2],
    //       height: oData[3],
    //       rotate: oData[5],
    //       shape: shape,
    //       style: {
    //         left: 0,
    //         top: 0,
    //         width: oData[2],
    //         height: oData[3],
    //         position: 'absolute',
    //         opacity: 1
    //       },
    //       svgStyle: {
    //         width: oData[2],
    //         height: oData[3],
    //         fill: 'pink',
    //         fillOpacity:0.2,
    //         stroke:'pink',
    //         strokeWidth: 3,
    //       },
    //       hover: text
    //     });
    //   }
    // }
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

        // 場域尺寸計算
        const leftArea = <HTMLDivElement> document.querySelector('.leftArea');
        this.chartService.calResultSize(this.calculateForm, gd, leftArea.clientWidth - this.chartService.leftSpace).then(res => {
          const layoutOption = {
            width: res[0],
            height: res[1]
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
        console.log('sdgsd5g56wr6565re4wh68e468r68her8h7er98798');
        let width = pixelXLinear(item.width);
        let height = pixelYLinear(item.height);
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
        }
        window.setTimeout(() => {
          item['style']['transform'] = `rotate(${item.rotate}deg)`;
          item['style'].opacity = 1;
        }, 0);
      }
      // for (const item of this.defaultBsList) {
      //   item['style'] = {
      //     left: `${pixelXLinear(item.x)}px`,
      //     bottom: `${pixelYLinear(item.y)}px`,
      //     position: 'absolute'
      //   };
      //   item['circleStyle'] = {
      //     left: `${pixelXLinear(item.x) + 15}px`,
      //     bottom: `${pixelYLinear(item.y) + 25}px`,
      //     position: 'absolute'
      //   };
      // }
      // 新增基站
      // const xy3: SVGRectElement = gd2.querySelector('.xy');
      // const rect3 = xy3.getBoundingClientRect();
      // const candisateXLinear = Plotly.d3.scale.linear()
      //   .domain([0, this.calculateForm.width])
      //   .range([0, rect3.width]);

      // const candisateYLinear = Plotly.d3.scale.linear()
      //   .domain([0, this.calculateForm.height])
      //   .range([0, rect3.height]);
      // for (const item of this.candidateList) {
      //   item['style'] = {
      //     left: `${candisateXLinear(item.x)}px`,
      //     bottom: `${candisateYLinear(item.y)}px`,
      //     position: 'absolute',
      //     // visibility: this.showCandidate
      //   };
      //   item['circleStyle'] = {
      //     left: `${candisateXLinear(item.x) + 15}px`,
      //     bottom: `${candisateYLinear(item.y) + 25}px`,
      //     position: 'absolute',
      //     // visibility: this.showCandidate
      //   };
      // }

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