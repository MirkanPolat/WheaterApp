import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  city = '';
  weatherData: any = null;
  loading = false;
  error = '';
  cityName = '';

  constructor(private weather: WeatherService) {}

  async searchCity() {
    if (!this.city.trim()) return;
    
    this.loading = true;
    this.error = '';
    
    try {
      // Koordinaten der Stadt abrufen
      const coords = await this.weather.getCoordinates(this.city);
      // Wetterdaten für diese Koordinaten abrufen
      this.weatherData = await this.weather.getWeather(coords.latitude, coords.longitude);
      this.cityName = this.city;
      console.log(this.weatherData); // Zum Debuggen
    } catch (err) {
      console.error('Fehler beim Abrufen:', err);
      this.error = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      this.weatherData = null;
    } finally {
      this.loading = false;
    }
  }

  // Wettercode in lesbaren Text umwandeln
  getWeatherDescription(code: number): string {
    // WMO Weather codes: https://open-meteo.com/en/docs
    const weatherCodes: {[key: number]: string} = {
      0: 'Klar',
      1: 'Überwiegend klar',
      2: 'Teilweise bewölkt',
      3: 'Bewölkt',
      45: 'Nebel',
      48: 'Reifnebel',
      51: 'Leichter Nieselregen',
      53: 'Mäßiger Nieselregen',
      55: 'Starker Nieselregen',
      61: 'Leichter Regen',
      63: 'Mäßiger Regen',
      65: 'Starker Regen',
      71: 'Leichter Schneefall',
      73: 'Mäßiger Schneefall',
      75: 'Starker Schneefall',
      95: 'Gewitter',
    };
    
    return weatherCodes[code] || 'Unbekannt';
  }
}
