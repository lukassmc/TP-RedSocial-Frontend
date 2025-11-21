import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicSearch } from './music-search';

describe('MusicSearch', () => {
  let component: MusicSearch;
  let fixture: ComponentFixture<MusicSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MusicSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
