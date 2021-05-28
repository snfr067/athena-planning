import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalUlThroughputComponent } from './signal-ul-throughput.component';

describe('SignalUlThroughputComponent', () => {
  let component: SignalUlThroughputComponent;
  let fixture: ComponentFixture<SignalUlThroughputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignalUlThroughputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignalUlThroughputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
