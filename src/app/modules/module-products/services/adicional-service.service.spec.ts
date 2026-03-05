import { TestBed } from '@angular/core/testing';

import { AdicionalServiceService } from './adicional-service.service';

describe('AdicionalServiceService', () => {
  let service: AdicionalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdicionalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
