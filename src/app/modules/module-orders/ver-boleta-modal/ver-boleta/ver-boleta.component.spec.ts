import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerBoletaComponent } from './ver-boleta.component';

describe('VerBoletaComponent', () => {
  let component: VerBoletaComponent;
  let fixture: ComponentFixture<VerBoletaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerBoletaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerBoletaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
