import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';

/**
 * 結果頁效能分析
 */
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit {

  constructor(private translateService: TranslateService) { }
  
  /** 結果資料 */
  result = {};
  /** 結果form */
  calculateForm = new CalculateForm();
  /** 地圖切面 list */
  zValueList = [];
  bsTptList = [];
  isHst = false;

  ngOnInit(): void {
  }

  /** set data */
  setData() {
    // 地圖切面 list
    const zValues = this.calculateForm.zValue.replace('[', '').replace(']', '').split(',');
    for (let i = 0; i < zValues.length; i++) {
      this.zValueList.push([
        zValues[i],
        this.result['layeredCoverage'][i],
        Number(this.result['layeredAverageSinr'][i]),
        Number(this.result['layeredAverageRsrp'][i])
      ]);
    }
    // console.log(totalServingUe);
    if (this.isHst) {
      // let totalServingCandBs = this.calculateForm.availableNewBsNumber - this.result['defaultidx'].length;
      let candidateNum = 0;
      if (this.calculateForm.candidateBs.includes('|')) {
        candidateNum = this.calculateForm.candidateBs.split('|').length;
      } else {
        if (this.calculateForm.candidateBs != '') {candidateNum = 1;}
      }
      let choseCand = this.result['candidateIdx'].sort(function(a, b){return a - b});
      console.log(candidateNum);
      console.log(choseCand);
      let k = 0;
      for (let i = 0;i < candidateNum; i++) {
        if (choseCand[k] != i) {
          continue;
        } else {
          k++
        }
        if (this.result['ueCon_perBsUeConnection'][i] == 0) {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
            0,
            0,
            0,
            0,
            0,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i}`,
            this.result['ueCon_perBsUeConnection'][i],
            this.result['ueTpt_dlTptIndividualBs'][i],
            this.result['ueTpt_ulTptIndividualBs'][i],
            Number(this.result['ueTpt_dlTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]),
            Number(this.result['ueTpt_ulTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]),
          ]);
        }
      }
      for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
        if (this.result['ueCon_perBsUeConnection'][i+candidateNum] == 0) {
          this.bsTptList.push([
            `${this.translateService.instant('defaultBs')}${i+1}`,
            0,
            0,
            0,
            0,
            0,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('defaultBs')}${i+candidateNum}`,
            this.result['ueCon_perBsUeConnection'][i+candidateNum],
            this.result['ueTpt_dlTptIndividualBs'][i+candidateNum],
            this.result['ueTpt_ulTptIndividualBs'][i+candidateNum],
            Number(this.result['ueTpt_dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]),
            Number(this.result['ueTpt_ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]),
          ]);
        }
      }
    } else {
      // let totalServingCandBs = this.calculateForm.availableNewBsNumber - this.result['defaultidx'].length;
      let candidateNum = 0;
      console.log(this.calculateForm.candidateBs);
      if (this.calculateForm.candidateBs.includes('|')) {
        candidateNum = this.calculateForm.candidateBs.split('|').length;
      } else {
        if (this.calculateForm.candidateBs != '') {candidateNum = 1;}
      }
      console.log(candidateNum);
      let choseCand = this.result['candidateIdx'].sort(function(a, b){return a - b});
      let k = 0;
      for (let i = 0;i < candidateNum; i++) {
        if (choseCand[k] != i) {
          continue;
        } else {
          k++
        }
        if (this.result['ueCon']['perBsUeConnection'][i] == 0) {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
            0,
            0,
            0,
            0,
            0,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
            this.result['ueCon']['perBsUeConnection'][i],
            this.result['ueTpt']['dlTptIndividualBs'][i],
            this.result['ueTpt']['ulTptIndividualBs'][i],
            Number(this.result['ueTpt']['dlTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]),
            Number(this.result['ueTpt']['ulTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]),
          ]);
          // console.log(Number(this.result['ueTpt']['dlTptIndividualBs'][i]));
          // console.log(Number(this.result['ueCon']['perBsUeConnection'][i]));
        }
      }
      // console.log(this.result['defaultBeamId']);
      for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
        if (this.result['ueCon']['perBsUeConnection'][i+candidateNum] == 0) {
          this.bsTptList.push([
            `${this.translateService.instant('defaultBs')}${i+1}`,
            0,
            0,
            0,
            0,
            0,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('defaultBs')}${i+1}`,
            this.result['ueCon']['perBsUeConnection'][i+candidateNum],
            this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum],
            this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum],
            Number(this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]),
            Number(this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]),
          ]);
        }
      }
    }
    
  }

  financial(x) {
    return Number.parseFloat(x).toFixed(1);
  }

  /** parse無資料為 - */
  parseNoData(val, isPercentage, type) {
    if (val == null || val === '') {
      return '-';
    } else {
      let result = Math.round(val * 1000) / 1000 + (isPercentage ? '' : '');
      // let result = Math.round(val * 1000) / 1000 + (isPercentage ? '%' : '');
      if (type === 'ueAverageRsrp') {
        result += 'dBm';
      } else if (type === 'ueAverageSinr') {
        result += 'dB';
      } else if (type === 'ueThroughput') {
        result += 'Mbps';
      }
      return result;
    }
  }

}
