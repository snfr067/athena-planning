import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubFieldComponent } from './sub-field.component';

describe('SubFieldComponent', () => {
  let component: SubFieldComponent;
  let fixture: ComponentFixture<SubFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
