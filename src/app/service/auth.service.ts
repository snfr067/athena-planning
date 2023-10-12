import { Injectable, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * 公用參數與function service
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    public router: Router,
    private translateService: TranslateService
  ) {
    this.userToken = window.sessionStorage.getItem('son_session');
    this.userId = window.sessionStorage.getItem('son_userId');
  }

  /** API URL */
    public API_URL = 'http://211.20.94.215:3000/son'; 
  // public API_URL = 'http://192.168.125.129:3000/son';
  /** 登入後的session_id */
  public userToken = null;
  /** 語系 */
  public lang = 'zh-TW';
  /** user id */
  public userId = null;

  /**
   * set user token
   * @param sonSession 
   * @param userId 
   */
  public setUserToken(sonSession: string, userId: string) {
    sessionStorage.setItem('son_session', sonSession);
    sessionStorage.setItem('son_userId', userId);
    this.userToken = sonSession;
    this.userId = userId;
  }

  /**
   * logout
   */
  public logout() {
    this.clearStorage();

    const form = {
      session: this.userToken
    };
    this.http.post(`${this.API_URL}/logout`, JSON.stringify(form)).subscribe(
      res => {
        this.router.navigate(['/logon']);
        window.setTimeout(() => {
          Object.keys(sessionStorage).forEach((d) => {
            sessionStorage.removeItem(d);
          });
        }, 0);
      }
    );
  }

  /**
   * get token from server and save TokenResponse to localstorage
   * @param treq TokenRequest
   */
  public logon(loginForm): Observable<any> {
    this.clearStorage();
    return this.http.post(`${this.API_URL}/login`, loginForm);
  }

  /**
   * 切換語系
   * @param langulage 
   */
  public changeLanguage(langulage) {
    this.translateService.use(langulage);
  }

  /** show loading */
  spinnerShow() {
    document.getElementById('ngxSpinnerShow').click();
  }

  /** hide loading */
  spinnerHide() {
    document.getElementById('ngxSpinnerHide').click();
  }

  /** show loading, 有home link */
  spinnerShowAsHome() {
    document.getElementById('ngxSpinnerShowAsHome').click();
  }

  /** show finish, percentage = 100% */
  showFinish() {
    document.getElementById('ngxSpinnerFinish').click();
  }

  /** show loading, 有home link */
  spinnerShowResult() {
    document.getElementById('ngxSpinnerShowResult').click();
  }

  spinnerShowPdf() {
    document.getElementById('ngxSpinnerShowPdf').click();
  }

  spinnerUploadData()
  {
    document.getElementById('ngxSpinnerUploadData').click();
  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  /**
   * parse材質數值為文字
   * @param val 
   */
  parseMaterial(val) {
    if (val === '0' || val === 0) {
      return this.translateService.instant('material.wood');
    } else if (val === '1' || val === 1) {
      return this.translateService.instant('material.cement');
    } else if (val === '2' || val === 2) {
      return this.translateService.instant('material.light_steel_frame');
    } else if (val === '3' || val === 3) {
      return this.translateService.instant('material.glass');
    } else if (val === '4' || val === 4) {
      return this.translateService.instant('material.stainless');
    } else if (val === '5' || val === 5) {
      return this.translateService.instant('material.fireproof');
    } else if (val === '6' || val === 6) {
      return this.translateService.instant('material.fireSoundproof');
    } else if (val === '7' || val === 7) {
      return this.translateService.instant('material.whiteBrick');
    } else if (val === '8' || val === 8) {
      return this.translateService.instant('material.flameproof');
    } else if (val === '9' || val === 9) {
      return this.translateService.instant('material.flameSoundproof');
    } else if (val === '10' || val === 10) {
      return this.translateService.instant('material.cabinet');
    }
    
  }

  /**
   * check is empty
   * @param val 
   */
  isEmpty(val) {
    if (val == null || val === 'null' || val === '' || val === 'undefined') {
      return true;
    } else {
      return false;
    }
  }

  /** clear Storage */
  clearStorage() {
    localStorage.removeItem(`${this.userToken}planningObj`);
    localStorage.removeItem(`${this.userToken}for3d`);
    sessionStorage.removeItem('rsrpThreshold');
    sessionStorage.removeItem('sinrThreshold');
    sessionStorage.removeItem('tempParamForSelect');
    sessionStorage.removeItem('calculateForm');
    sessionStorage.removeItem('tempParamForSelect');
    sessionStorage.removeItem('tempParam');
    sessionStorage.removeItem('sub_field_coor');
  }

  generateRandomColorSet(planningIndex, defaultBSLen)
  {
    console.log(defaultBSLen)
    /** defaultBs預設顏色 */
    const DEFAULT_BS_COLOR = '#2958be';
    /** defaultBs的號碼預設顏色 */
    const DEFAULT_BS_CIRCLE_COLOR = '#338aee';

    let lightColor = 'rgba(255,255,255,1)';
    let darkColor = 'rgba(255,255,255,1)';
    if (planningIndex == '3')
    {
      let index = defaultBSLen % 3;

      let lrgb = [];
      let drgb = [];

      let switchColor = Math.floor(Math.random() * 3);
      let random = Math.floor(Math.random() * 2);
      let zeroColor = 0;
      let fullColor = 0;

      console.log(`switchColor = ${switchColor}`);

      lrgb[switchColor] = Math.floor(Math.random() * 85 + index * 85);
      console.log(`lrgb[switchColor] = ${lrgb[switchColor]}`);
      drgb[switchColor] = lrgb[switchColor];

      if (random % 2 == 0)
      {
        zeroColor = switchColor - 1;
        fullColor = switchColor + 1;
        if (zeroColor < 0)
          zeroColor += 3;
        if (fullColor >= 3)
          fullColor -= 3;
      }
      else
      {
        zeroColor = switchColor + 1;
        fullColor = switchColor - 1;
        if (zeroColor >= 3)
          zeroColor -= 3;
        if (fullColor < 0)
          fullColor += 3;
      }
      drgb[zeroColor] = 50;//Math.floor(Math.random() * 51);
      lrgb[zeroColor] = drgb[zeroColor] + 50;
      drgb[fullColor] = 180;
      lrgb[fullColor] = 180;

      lightColor = `rgba(${lrgb[0]},${lrgb[1]},${lrgb[2]},1)`;
      darkColor = `rgba(${drgb[0]},${drgb[1]},${drgb[2]},1)`;

      console.log(`lightColor = ${lightColor}`);
      console.log(`darkColor = ${darkColor}`);
    }
    else
    {
      lightColor = DEFAULT_BS_CIRCLE_COLOR;
      darkColor = DEFAULT_BS_COLOR;
    }
    return [lightColor, darkColor];
  }

  getRandomColorByHsl(planningIndex, index)
  {
    let h, s, l;
    let lightColor, darkColor;
    const MAX_L = 50;
    const MIN_L = 20;
    const LIGHT_ADD = 20;
    const INTERVAL = 100;
    const MAX_H = 360;
    const MAX_S = 100;
    const MIN_S = 50;
    /** defaultBs預設顏色 */
    const DEFAULT_BS_COLOR = '#2958be';
    /** defaultBs的號碼預設顏色 */
    const DEFAULT_BS_CIRCLE_COLOR = '#338aee';


    if (planningIndex == '3')
    {
      let h_add = (index + 1) * INTERVAL;
      console.log(h_add);
      console.log(INTERVAL);
      console.log(index);
      h = h_add % (MAX_H + 1);
      console.log(MAX_H + 1);
      l = Math.floor(Math.random() * ((MAX_L - MIN_L) + 1) + MIN_L);
      s = Math.floor(Math.random() * ((MAX_S - MIN_S) + 1) + MIN_S);
      lightColor
      lightColor = `hsl(${h},${s}%,${Number(l + LIGHT_ADD)}%)`;
      darkColor = `hsl(${h},${s}%,${l}%)`;
    }
    else
    {
      lightColor = DEFAULT_BS_CIRCLE_COLOR;
      darkColor = DEFAULT_BS_COLOR;
    }
    console.log(darkColor);
    return [lightColor, darkColor];
  }

  changeHSLToRGB(H, S, L)
  {
    S /= 100;
    L /= 100;
    let c = (1 - Math.abs(2 * L - 1)) * S;
    let x = c * (1 - Math.abs(H / 60 % 2 - 1));
    let m = L - c / 2;

    let _r, _g, _b;
    let r, g, b;

    if (H >= 0 && H < 60)
    {
      _r = c;
      _g = x;
      _b = 0;
    }
    else if (H >= 60 && H < 120)
    {
      _r = x;
      _g = c;
      _b = 0;
    }
    else if (H >= 120 && H < 180)
    {
      _r = 0;
      _g = c;
      _b = x;
    }
    else if (H >= 180 && H < 240)
    {
      _r = 0;
      _g = x;
      _b = c;
    }
    else if (H >= 240 && H < 300)
    {
      _r = x;
      _g = 0;
      _b = c;
    }
    else if (H >= 300 && H < 360)
    {
      _r = c;
      _g = 0;
      _b = x;
    }

    r = (_r + m) * 255;
    g = (_g + m) * 255;
    b = (_b + m) * 255;    

    return [r, g, b];
  }

  changeOldFormToDASForm(calculateForm, allAntennaList)
  {
    if (calculateForm != null && calculateForm.isSimulation)
    {
      if (calculateForm.bsList == null)
        calculateForm.bsList = {};

      console.log(`${calculateForm}`)
      console.log(`${calculateForm.defaultBs}`)
      console.log(`${calculateForm.defaultBsAnt}`)
      console.log(`${calculateForm.bsNoiseFigure}`)
      console.log(`${calculateForm.bandwidth}`)
      console.log(`${calculateForm.ulMcsTable}`)
      console.log(`${calculateForm.dlMcsTable}`)
      console.log(`${calculateForm.scs}`)
      console.log(`${calculateForm.duplex}`)
      console.log(`${calculateForm.tddFrameRatio}`)
      console.log(`${calculateForm.bsList.defaultBs}`)

      let isOldFormat = calculateForm.defaultBs != null &&
        calculateForm.defaultBsAnt != null &&
        calculateForm.bsNoiseFigure != null &&
        calculateForm.bandwidth != null &&
        calculateForm.ulMcsTable != null &&
        calculateForm.dlMcsTable != null &&
        calculateForm.scs != null &&
        calculateForm.duplex != null &&
        calculateForm.ulMimoLayer != null &&
        calculateForm.dlMimoLayer != null &&
        calculateForm.bsList.defaultBs == null;

      let isNoAntFormat = calculateForm.defaultBsAnt == null || calculateForm.defaultBsAnt == "";
      let isNoBsNoiseFormat = calculateForm.bsNoiseFigure == null || calculateForm.bsNoiseFigure == "";

      console.log(`${isOldFormat}`)

      if (isOldFormat)
      {
        let defaultBsArr = calculateForm.defaultBs.split('|');
        let defaultBsAntArr = calculateForm.defaultBsAnt.split('|');
        calculateForm.bsList.defaultBs = [];
        for (let bs = 0; bs < defaultBsArr.length; bs++)
        {
          let ID = bs;
          let position = JSON.parse(defaultBsArr[bs]);
          let txPower = 0;;
          let color = this.getRandomColorByHsl('3', bs);
          let antennaID = 1;//JSON.parse(defaultBsAntArr[bs])[0];
          let antennaGain = 0;
          let antennaTheta = 0;
          let antennaPhi = 0;
          let antFreq = 0;
          let antenna = [];
          let noiseFigure = 0;//JSON.parse(calculateForm.bsNoiseFigure)[bs];
          let duplex = {};

          if (!isNoAntFormat)
          {
            antennaID = JSON.parse(defaultBsAntArr[bs])[0];
            antennaGain = JSON.parse(defaultBsAntArr[bs])[3];
            antennaTheta = JSON.parse(defaultBsAntArr[bs])[1];
            antennaPhi = JSON.parse(defaultBsAntArr[bs])[2];
          }
          if (!isNoBsNoiseFormat)
            noiseFigure = JSON.parse(calculateForm.bsNoiseFigure)[bs];

          if (calculateForm.txPower == null && calculateForm.output != null)
          {
            txPower = JSON.parse(calculateForm.output.defaultBspower)[bs];
          }
          else if (calculateForm.txPower != null)
          {
            txPower = JSON.parse(calculateForm.txPower)[bs];
          }
          else
          {
            txPower = 0;
          }

          for (let a = 0; a < allAntennaList.length; a++)
          {
            if (allAntennaList[a].antennaID = antennaID)
            {
              antFreq = allAntennaList[a].availableFrequency[0].frequency;
              break;
            }
          }
          antenna = [
            {
              antennaID: antennaID,
              position: position,
              gain: antennaGain,
              theta: antennaTheta,
              phi: antennaPhi,
              ulFrequency: antFreq,
              dlFrequency: antFreq,
            }
          ];
          duplex = {
            isTdd: (calculateForm.duplex == 'tdd'),
            isFdd: (calculateForm.duplex == 'fdd'),
            tddParam:
            {
              ul: {
                bandwidth: JSON.parse(calculateForm.bandwidth)[bs],
                frameRatio: calculateForm.tddframeratio,
                frequency: JSON.parse(calculateForm.frequency)[bs],
                mcsTable: calculateForm.ulMcsTable.toString().replace("[", "").replace("]", "").split(',')[bs],   //內有非數字字元使用JSON.parse會出錯
                scs: JSON.parse(calculateForm.scs)[bs],
                mimo: JSON.parse(calculateForm.ulMimoLayer)[bs],
              },
              dl: {
                bandwidth: JSON.parse(calculateForm.bandwidth)[bs],
                frameRatio: calculateForm.tddframeratio,
                frequency: JSON.parse(calculateForm.frequency)[bs],
                mcsTable: calculateForm.dlMcsTable.toString().replace("[", "").replace("]", "").split(',')[bs],
                scs: JSON.parse(calculateForm.scs)[bs],
                mimo: JSON.parse(calculateForm.dlMimoLayer)[bs],
              }
            },
            fddParam:
            {
              ul: {
                bandwidth: JSON.parse(calculateForm.bandwidth)[bs],
                frameRatio: calculateForm.tddframeratio,
                frequency: JSON.parse(calculateForm.frequency)[bs],
                mcsTable: calculateForm.ulMcsTable.toString().replace("[", "").replace("]", "").split(',')[bs],
                scs: JSON.parse(calculateForm.scs)[bs],
                mimo: JSON.parse(calculateForm.ulMimoLayer)[bs],
              },
              dl: {
                bandwidth: JSON.parse(calculateForm.bandwidth)[bs],
                frameRatio: calculateForm.tddframeratio,
                frequency: JSON.parse(calculateForm.frequency)[bs],
                mcsTable: calculateForm.dlMcsTable.toString().replace("[", "").replace("]", "").split(',')[bs],
                scs: JSON.parse(calculateForm.scs)[bs],
                mimo: JSON.parse(calculateForm.dlMimoLayer)[bs],
              }
            }
          }

          calculateForm.bsList.defaultBs.push({
            ID: ID,
            color: color,
            position: position,
            antenna: antenna,
            duplex: duplex,
            noiseFigure: noiseFigure,
            txPower: txPower
          });
        }
      }
    }
    else
    {
      console.log(`calculateForm == null`);
    }

    console.log(`${JSON.stringify(calculateForm)}`);

    return calculateForm;
  }
}
