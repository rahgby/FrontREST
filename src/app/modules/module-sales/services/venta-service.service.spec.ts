import { TestBed } from '@angular/core/testing';

import { VentaServiceService } from './venta-service.service';

describe('VentaServiceService', () => {
  let service: VentaServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentaServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
