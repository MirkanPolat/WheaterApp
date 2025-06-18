import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './app.component.html',
})
export class AppComponent {
  city = '';
  weatherData: any = null;

  constructor(private weather: WeatherService) {}

  async searchCity() {
    try {
      const woeid = await this.weather.getCityWoeid(this.city);
      this.weatherData = await this.weather.getWeather(woeid);
    } catch (err) {
      console.error('Fehler beim Abrufen:', err);
      this.weatherData = null;
    }
  }
}