import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { ChartService } from '../../../service/chart.service';

declare var Plotly: any;

/**
 * 建議方案
 */
@Component({
  selector: 'app-propose',
  templateUrl: './propose.component.html',
  styleUrls: ['./propose.component.scss']
})
export class ProposeComponent implements OnInit {

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
  /** 建議方案 list */
  candidateList = [];
  /** 既有基站 list */
  // defaultBsList = [];
  /** 是否PDF頁面 */
  isPDF = false;

  /** 圖element */
  @ViewChild('layoutChart') layoutChart: ElementRef;
  /** table element */
  @ViewChild('proposeTbody') proposeTbody: ElementRef<HTMLElement>;
  /** image element */
  @ViewChild('proposeImg') proposeImg: ElementRef<HTMLImageElement>;

  @HostListener('window:resize') windowResize() {
    const leftArea = <HTMLDivElement> document.querySelector('.leftArea');
    const maxWidth = leftArea.clientWidth - this.chartService.leftSpace;
    Plotly.relayout('layout_chart', {
      width: maxWidth
    }).then(gd => {
      const sizes = this.chartService.calResultSize(this.calculateForm, gd, maxWidth);
      const layoutOption = {
        width: sizes[0],
        height: sizes[1]
      };
      Plotly.relayout('layout_chart', layoutOption);
    });
  }

  ngOnInit(): void {
  }

  /**
   * draw layout
   * @param isPDF 
   */
  drawLayout(isPDF) {
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
          layer: 'below',
          opacity: 0.2
        });

        this.draw(isPDF, images);
      };
    } else {
      this.draw(isPDF, images);
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
      id = document.querySelector('#pdf_area').querySelector('#layout_chart');
    } else {
      id = document.querySelector('#layout_chart');
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
    this.candidateList.length = 0;
    // 建議方案 list
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
          text: `\t${numMap[this.result['chosenCandidate'][i].toString()]}<br>✅`,
          marker: {
            size: 28,
            color: color,
            symbol: 'arrow-bar-down-open'
          },
          textfont: {
            size: 24,
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
            size: 24,
            color: 'gray',
            symbol: 'x'
          },
          textfont: {
            size: 24,
            color: 'red'
          },
          textposition: 'right top',
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
            if (isPDF) {
              window.setTimeout(() => {
                this.toImg();
              }, 0);
            }
            console.log('layout plot done.');
          });
        });
        
  
      });
    }
    
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
      
      this.proposeTbody.nativeElement.style.display = 'none';
      console.log('propose dom to img');
    });
  }

}
