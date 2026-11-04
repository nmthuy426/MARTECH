import { TestBed } from '@angular/core/testing';
import { MartechService } from './martech-service';

describe('MartechService', () => {
  let service: MartechService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MartechService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
