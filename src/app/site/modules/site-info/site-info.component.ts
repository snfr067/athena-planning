import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/auth.service';

/**
 * 結果頁場域設定資訊
 */
@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit {

  constructor(
    private translateService: TranslateService,
    private authService: AuthService
  ) { }

  /** 結果data */
  result = {};
  /** 結果form */
  calculateForm = new CalculateForm();
  /** 待選基站數量 */
  inputBsListCount = 0;
  /** 現有基站數量 */
  defaultBsCount = 0;
  /** 規劃目標 */
  planningObj = {
    isAverageSinr: false,
    isCoverage: false,
    isUeAvgSinr: false,
    isUeAvgThroughput: false,
    isUeCoverage: false
  };
  unAchievedObj = {    
    isFieldSINRUnAchieved: false,
    isFieldRSRPUnAchieved: false,
    isFieldThroughputUnAchieved: false,
    isFieldCoverageUnAchieved: false,
    isUEThroughputByRsrpUnAchieved: false,
    isUECoverageUnAchieved: false
  };
  realRatio = {
    fieldCoverage: 0,
    fieldSINR : 0,
    fieldRSRP : 0,
    fieldThroughput : 0,
    ueCoverage : 0,
    ueThroughput : 0,
  };

  ngOnInit(): void {
    // console.log(sessionStorage.getItem('planningObj'));
    // if (localStorage.getItem(`${this.authService.userToken}planningObj`) != null) {
    //   this.planningObj = JSON.parse(localStorage.getItem(`${this.authService.userToken}planningObj`));
    //   console.log(this.planningObj);
    // }
    // console.log(this.result);
    // setInterval(()=> {console.log(this.calculateForm);},10000);

    if (localStorage.getItem(`unAchievedObj`) != null) {
      this.unAchievedObj = JSON.parse(localStorage.getItem(`unAchievedObj`));
    }
    console.log(this.calculateForm);
    console.log(this.unAchievedObj);
  }

  /** parse 網路種類 */
  parseOB(type) {
    if (Number(type) === 0) {
      return '4G';
    } else if (Number(type) === 1) {
      return '5G';
    } else if (Number(type) === 2) {
      return 'WiFi';
    }
  }

  /** i18n replace 待選基站位置( 共{0}處 ) */
  getWaitSelect() {
    return this.translateService.instant('result.propose.wait_select_2')
    .replace('{0}', this.inputBsListCount);
  }

  /** i18n replace 現有基站(共{0}台) */
  getBsCount() {
    return this.translateService.instant('result.bs.count')
    .replace('{0}', this.defaultBsCount);
  }

  toUpper(str) {
    if (str == 'tdd') {
      return "TDD";
    } else {
      return "FDD";
    }
  }

}
