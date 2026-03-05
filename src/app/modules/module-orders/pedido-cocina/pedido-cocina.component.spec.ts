import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoCocinaComponent } from './pedido-cocina.component';

describe('PedidoCocinaComponent', () => {
  let component: PedidoCocinaComponent;
  let fixture: ComponentFixture<PedidoCocinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedidoCocinaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoCocinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
