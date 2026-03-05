import { TestBed } from '@angular/core/testing';

import { PlatosServiceService } from './platos-service.service';

describe('PlatosServiceService', () => {
  let service: PlatosServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatosServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
