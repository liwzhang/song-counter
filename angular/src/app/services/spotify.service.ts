import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  constructor(private http: HttpClient) {}

  login() {
    return this.http.get('http://localhost:4200/api/login');
  }
}
