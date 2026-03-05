import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPedidosModalComponent } from './editar-pedidos-modal.component';

describe('EditarPedidosModalComponent', () => {
  let component: EditarPedidosModalComponent;
  let fixture: ComponentFixture<EditarPedidosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPedidosModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPedidosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
