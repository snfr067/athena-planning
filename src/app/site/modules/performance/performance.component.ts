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
  bsTptAvg = [];
  isHst = false;
  rsrpTh = -90;
  sinrTh = 15;
  zCoverageRsrp;
  avgCoverageRsrp = 0;
  zCoverageSinr;
  avgCoverageSinr = 0;


  ngOnInit(): void {
  }

  /** set data */
  setData() {
    this.rsrpTh = Number(sessionStorage.getItem('rsrpThreshold'));
    this.sinrTh = Number(sessionStorage.getItem('sinrThreshold'));
    // 地圖切面 list
    console.log(this.result);
    this.zCoverageRsrp = [0, 0, 0];
    this.zCoverageSinr = [0, 0, 0];
    this.avgCoverageRsrp = 0;
    const zValues = this.calculateForm.zValue.replace('[', '').replace(']', '').split(',');
    console.log(zValues.length);

    for (let i = 0;i < zValues.length; i++) {
      // this.zCoverageRsrp.push(0);
      for (let j = 0;j < this.result['rsrpMap'].length;j++) {
        for (let k = 0;k < this.result['rsrpMap'][0].length;k++) {
          if (this.result['rsrpMap'][j][k][i] > this.rsrpTh) {
            this.zCoverageRsrp[i]++;
          }
        }
      }
    }
    for (let i = 0; i < zValues.length; i++) {
      // this.zCoverageRsrp.push(0);
      for (let j = 0; j < this.result['sinrMap'].length; j++) {
        for (let k = 0; k < this.result['sinrMap'][0].length; k++) {
          if (this.result['sinrMap'][j][k][i] > this.sinrTh) {
            this.zCoverageSinr[i]++;
          }
        }
      }
    }
    this.zCoverageRsrp = this.zCoverageRsrp.map(el => (el / (this.result['rsrpMap'].length * this.result['rsrpMap'][0].length) * 100));
    this.zCoverageSinr = this.zCoverageSinr.map(el => (el / (this.result['sinrMap'].length * this.result['sinrMap'][0].length) * 100));
    console.log(this.zCoverageRsrp);
    for (let i = 0; i < zValues.length; i++) {
      this.zValueList.push([
        zValues[i],
        this.result['layeredCoverage'][i],
        Number(this.result['layeredAverageSinr'][i]),
        Number(this.result['layeredAverageRsrp'][i]),
        Number(this.floatToString(this.zCoverageRsrp[i])),
        Number(this.floatToString(this.zCoverageSinr[i]))
      ]);
      this.avgCoverageRsrp += Number(this.zCoverageRsrp[i]);
      this.avgCoverageSinr += Number(this.zCoverageSinr[i]);
    }
    this.avgCoverageRsrp = Number(this.floatToString(this.avgCoverageRsrp / zValues.length));
    this.avgCoverageSinr = Number(this.floatToString(this.avgCoverageSinr / zValues.length));
    
    // console.log(totalServingUe);
    if (this.isHst) {
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
            `0 Mbps`,
            `0 Mbps`,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
            this.result['ueCon_perBsUeConnection'][i],
            this.result['ueTpt_dlTptIndividualBs'][i],
            this.result['ueTpt_ulTptIndividualBs'][i],
            `${this.financial(Number(this.result['ueTpt_dlTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]))}Mbps`,
            `${this.financial(Number(this.result['ueTpt_ulTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]))}Mbps`,
          ]);
        }
      }
      for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
        if (this.result['ueCon_perBsUeConnection'][i+candidateNum] == 0) {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
            0,
            0,
            0,
            `0 Mbps`,
            `0 Mbps`,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
            this.result['ueCon_perBsUeConnection'][i+candidateNum],
            this.result['ueTpt_dlTptIndividualBs'][i+candidateNum],
            this.result['ueTpt_ulTptIndividualBs'][i+candidateNum],
            `${this.financial(Number(this.result['ueTpt_dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]))}Mbps`,
            `${this.financial(Number(this.result['ueTpt_ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]))}Mbps`,
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
            `0 Mbps`,
            `0 Mbps`,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
            this.result['ueCon']['perBsUeConnection'][i],
            this.result['ueTpt']['dlTptIndividualBs'][i],
            this.result['ueTpt']['ulTptIndividualBs'][i],
            `${this.financial(Number(this.result['ueTpt']['dlTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]))}Mbps`,
            `${this.financial(Number(this.result['ueTpt']['ulTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]))}Mbps`,
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
            `0 Mbps`,
            `0 Mbps`,
          ]);
        } else {
          this.bsTptList.push([
            `${this.translateService.instant('defaultBs')}${i+1}`,
            this.result['ueCon']['perBsUeConnection'][i+candidateNum],
            this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum],
            this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum],
            `${this.financial(Number(this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]))}Mbps`,
            `${this.financial(Number(this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]))}Mbps`,
          ]);
        }
      }
    }
    //場域平均和加總
    let ueNum = 0;
    let fieldTotalDlTpt = 0;
    let fieldTotalUlTpt = 0;
    for (let i = 0;i < this.bsTptList.length;i++) {
      ueNum += this.bsTptList[i][1]
      fieldTotalDlTpt += this.bsTptList[i][2];
      fieldTotalUlTpt += this.bsTptList[i][3];
    }
    this.bsTptAvg = [
      this.translateService.instant('result.total'),
      ueNum,
      fieldTotalDlTpt,
      fieldTotalUlTpt,
      '-',
      '-',
    ];
  }

  financial(x) {
    return Number.parseFloat(x).toFixed(2);
  }

  floatToString(x) {
    return Number.parseFloat(x).toString().slice(0,5);
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
