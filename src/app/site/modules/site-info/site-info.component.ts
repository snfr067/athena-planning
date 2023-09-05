import { Component, OnInit, Input } from '@angular/core';
import { CalculateForm } from '../../../form/CalculateForm';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/auth.service';
import { HttpClient } from '@angular/common/http';

/**
 * 結果頁場域設定資訊
 */
@Component({
  selector: 'app-site-info',
  templateUrl: './site-info.component.html',
  styleUrls: ['./site-info.component.scss']
})
export class SiteInfoComponent implements OnInit
{

  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  /** 結果data */
  result = {};
  /** 結果form */
  calculateForm = new CalculateForm();
  /** 候選基站位置數量 */
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
    fieldSINR: 0,
    fieldRSRP: 0,
    fieldThroughput: 0,
    ueCoverage: 0,
    ueThroughput: 0,
  };


  realFieldCoverage;
  realFieldSINR = [];
  realFieldRSRP = [];
  realFieldULThroughput = [];
  realFieldDLThroughput = [];
  realUECoverage;
  realUEULThroughput = [];
  realUEDLThroughput = [];

  pathLossModel =
    {
      name:"",
      distancePowerLoss: 0,
      fieldLoss: 0
    };

  async ngOnInit(): Promise<void>
  {
    // console.log(sessionStorage.getItem('planningObj'));
    // if (localStorage.getItem(`${this.authService.userToken}planningObj`) != null) {
    //   this.planningObj = JSON.parse(localStorage.getItem(`${this.authService.userToken}planningObj`));
    //   console.log(this.planningObj);
    // }
    // console.log(this.result);
    // setInterval(()=> {console.log(this.calculateForm);},10000);

    if (localStorage.getItem(`unAchievedObj`) != null)
    {
      this.unAchievedObj = JSON.parse(localStorage.getItem(`unAchievedObj`));
    }
    this.getPathLossModel();
    
  }



  /** parse 網路種類 */
  parseOB(type)
  {
    if (Number(type) === 0)
    {
      return '4G';
    } else if (Number(type) === 1)
    {
      return '5G';
    } else if (Number(type) === 2)
    {
      return 'WiFi';
    }
  }

  /** i18n replace 候選基站位置位置( 共{0}處 ) */
  getWaitSelect()
  {
    return this.translateService.instant('result.propose.wait_select_2')
      .replace('{0}', this.inputBsListCount);
  }

  /** i18n replace 現有基站(共{0}台) */
  getBsCount()
  {
    return this.translateService.instant('result.bs.count')
      .replace('{0}', this.defaultBsCount);
  }

  toUpper(str)
  {
    if (str == 'tdd')
    {
      return "TDD";
    } else
    {
      return "FDD";
    }
  }
  async getPathLossModel()
  {
    let retPathLossModel = {
      name: "",
      distancePowerLoss: 0,
      fieldLoss: 0
    };
    let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
    let result = await this.http.get(url_get).toPromise();
    let modelList = Object.values(result);
    console.log(`${JSON.stringify(modelList)}`);
    console.log(`${JSON.stringify(this.calculateForm)}`);
    for (let m = 0; m < modelList.length; m++)
    {
      if (this.calculateForm.pathLossModelId == modelList[m].id)
      {
        retPathLossModel = {
          name: (this.authService.lang == 'zh-TW') ? modelList[m]['chineseName'] : modelList[m]['name'],
          distancePowerLoss: modelList[m]['distancePowerLoss'],
          fieldLoss: modelList[m]['fieldLoss']
        };
        console.log(`${JSON.stringify(retPathLossModel)}`);
        break;
      }
    }


    this.pathLossModel = retPathLossModel;
  }
}
