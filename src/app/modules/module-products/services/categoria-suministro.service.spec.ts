import { TestBed } from '@angular/core/testing';

import { CategoriaSuministroService } from './categoria-suministro.service';

describe('CategoriaSuministroService', () => {
  let service: CategoriaSuministroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriaSuministroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
