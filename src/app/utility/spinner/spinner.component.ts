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
  /** 進度百分比 */
  percentageVal = 0;
  showPercentage = false;

  time;

  ngOnInit(): void {
    this.percentageVal = 0;
  }

  addTime() {
    if (this.percentageVal < 100) {
      this.time = window.setTimeout(() => {
        this.percentageVal++;
        this.addTime();
      }, 3000);
    } else {
      window.clearTimeout(this.time);
    }
  }

  /** show loading */
  show() {
    this.showCal = false;
    this.showLoad = true;
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
    this.showLoad = false;
    this.showCal = true;
    this.showHome = true;
    this.percentageVal = 0;
    this.showPercentage = true;
    window.clearTimeout(this.time);
    this.addTime();
    this.spinner.show();
  }

  /** show loading, 有運算中 */
  showCalculating() {
    this.showLoad = false;
    this.showCal = true;
    this.showHome = false;
    this.percentageVal = 0;
    this.showPercentage = true;
    this.addTime();
    this.spinner.show();
  }

  showResult() {
    this.showLoad = false;
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
