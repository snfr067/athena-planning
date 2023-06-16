import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

/**
 * 公用loading dialog util
 */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  constructor(public spinner: NgxSpinnerService, private router: Router) { }

  /** 顯示回首頁 */
  showHome = false;
  /** 顯示運算中 */
  showCal = true;
  /** 顯示運算中 */
  showRes = false;
  /** 顯示loading */
  showLoad = false;
  /** 顯示loading */
  showPdf = false;
  /** 進度百分比 */
  percentageVal = 0;
  showPercentage = false;
  isFinish = false;

  time;

  ngOnInit(): void {
    this.percentageVal = 0;
  }

  addTime() {
    if (this.percentageVal < 20) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 3000);
    } else if (this.percentageVal < 30) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 5000);
    } else if (this.percentageVal < 40) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 7000);
    } else if (this.percentageVal < 50) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 9000);
    } else if (this.percentageVal < 60) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 11000);
    } else if (this.percentageVal < 70) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 13000);
    } else if (this.percentageVal < 80) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 15000);
    } else if (this.percentageVal < 90) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 17000);
    } else if (this.percentageVal < 100) {
      this.time = window.setTimeout(() => {
        if(!this.isFinish)
        {
          this.percentageVal++;
          this.addTime();
        }
      }, 20000);
    } else {
      window.clearTimeout(this.time);
    }
  }

  finish() {
    this.percentageVal = 100;
  }

  /** show loading */
  show() {
    this.showCal = false;
    this.showLoad = true;
    this.showPdf = false;
    this.showRes = false;
    this.showHome = false;
    this.showPercentage = false;
    this.spinner.show();
  }

  /** hide loading */
  hide() {
    this.spinner.hide();
  }

  /** show loading, 有home link */
  showAsHome() {
    this.isFinish = false;
    this.showLoad = false;
    this.showCal = true;
    this.showPdf = false;
    this.showHome = true;
    this.showRes = false;
    this.percentageVal = 0;
    this.showPercentage = true;
    window.clearTimeout(this.time);
    this.addTime();
    this.spinner.show();
  }

  /** show finish, percentage = 100% */
  showFinish() {    
    this.finish();
    this.isFinish = true;
  }

  /** show loading, 有運算中 */
  showCalculating() {
    this.showLoad = false;
    this.showCal = true;
    this.showPdf = false;
    this.showHome = false;
    this.showRes = false;
    this.percentageVal = 0;
    this.showPercentage = true;
    this.addTime();
    this.spinner.show();
  }

  /** show pdfing, 有運算中 */
  showpdf() {
    this.showLoad = false;
    this.showCal = false;
    this.showPdf = true;
    this.showHome = false;
    this.showRes = false;
    this.percentageVal = 0;
    this.showPercentage = false;
    this.addTime();
    this.spinner.show();
  }

  showResult() {
    this.showLoad = false;
    this.showPdf = false;
    this.showCal = false;
    this.showHome = false;
    this.showRes = true;
    // this.percentageVal = 0;
    this.showPercentage = false;
    // this.addTime();
    this.spinner.show();
  }

  home() {
    this.spinner.hide();
    this.router.navigate(['/']);
    // location.href = '';
  }

}
