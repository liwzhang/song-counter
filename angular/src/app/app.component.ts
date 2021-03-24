import { Component } from '@angular/core';
import { SpotifyService } from './services/spotify.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular';
  curSong;
  constructor(private service: SpotifyService) {}

  onLogin() {
    this.service.login().subscribe((res) => {
      this.curSong = res;
    });
  }
}
