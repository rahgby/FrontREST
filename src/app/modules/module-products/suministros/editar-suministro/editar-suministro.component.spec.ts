import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSuministroComponent } from './editar-suministro.component';

describe('EditarSuministroComponent', () => {
  let component: EditarSuministroComponent;
  let fixture: ComponentFixture<EditarSuministroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarSuministroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSuministroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
