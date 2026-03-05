import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarSuministroComponent } from './agregar-suministro.component';

describe('AgregarSuministroComponent', () => {
  let component: AgregarSuministroComponent;
  let fixture: ComponentFixture<AgregarSuministroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarSuministroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarSuministroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
