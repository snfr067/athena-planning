import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePlanningMapComponent } from './site-planning-map.component';

describe('SitePlanningMapComponent', () => {
  let component: SitePlanningMapComponent;
  let fixture: ComponentFixture<SitePlanningMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitePlanningMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitePlanningMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
