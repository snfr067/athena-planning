import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalDlThroughputComponent } from './signal-dl-throughput.component';

describe('SignalDlThroughputComponent', () => {
  let component: SignalDlThroughputComponent;
  let fixture: ComponentFixture<SignalDlThroughputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalDlThroughputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalDlThroughputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
