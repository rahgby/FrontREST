import { TestBed } from '@angular/core/testing';

import { SuministroServiceService } from './suministro-service.service';

describe('SuministroServiceService', () => {
  let service: SuministroServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuministroServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
