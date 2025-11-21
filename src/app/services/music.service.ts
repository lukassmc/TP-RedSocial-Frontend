import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MusicService {
  searchSongs(term: string): Observable<any> {
    return this.http.get(
      `https://itunes.apple.com/search?term=${term}&media=music&limit=20`
    );
  }

  constructor(private http: HttpClient) {}
}