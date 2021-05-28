import { TestBed } from '@angular/core/testing';

import { QShopFormService } from './qshop-form.service';

describe('QShopFormService', () => {
  let service: QShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
