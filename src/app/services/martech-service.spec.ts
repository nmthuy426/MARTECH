import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { MarTechService } from './martech-service';

describe('MarTechService', () => {
  let service: MarTechService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],});
    service = TestBed.inject(MarTechService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
