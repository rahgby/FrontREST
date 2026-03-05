import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoMontoInicialComponent } from './dialogo-monto-inicial.component';

describe('DialogoMontoInicialComponent', () => {
  let component: DialogoMontoInicialComponent;
  let fixture: ComponentFixture<DialogoMontoInicialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogoMontoInicialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoMontoInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
