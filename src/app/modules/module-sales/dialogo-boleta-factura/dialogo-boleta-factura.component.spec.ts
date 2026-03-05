import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoBoletaFacturaComponent } from './dialogo-boleta-factura.component';

describe('DialogoBoletaFacturaComponent', () => {
  let component: DialogoBoletaFacturaComponent;
  let fixture: ComponentFixture<DialogoBoletaFacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoBoletaFacturaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoBoletaFacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
