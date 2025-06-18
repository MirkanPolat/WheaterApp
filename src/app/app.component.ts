import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { WeatherService, CityResult } from './weather.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  city = '';
  weatherData: any = null;
  loading = false;
  error = '';
  cityName = '';
  
  // Autocomplete
  citySuggestions: CityResult[] = [];
  showSuggestions = false;
  searchSubject = new Subject<string>();

  constructor(private weather: WeatherService) {
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchCities(query);
    });
  }

  // TrackBy functions for performance
  trackBySuggestion(index: number, item: CityResult): number {
    return item.id;
  }

  trackByForecast(index: number, item: string): number {
    return index;
  }

  // Wird bei jeder Eingabe aufgerufen
  onCityInput() {
    if (this.city.length >= 2) {
      this.searchSubject.next(this.city);
      this.showSuggestions = true;
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  // Städte für Autocomplete suchen
  async searchCities(query: string) {
    try {
      this.citySuggestions = await this.weather.searchCities(query);
    } catch (err) {
      console.error('Fehler bei Städtesuche:', err);
      this.citySuggestions = [];
    }
  }

  // Stadt aus Vorschlagsliste auswählen
  selectCity(cityResult: CityResult) {
    this.city = cityResult.name;
    this.showSuggestions = false;
    this.citySuggestions = [];
    this.searchCityWeather(cityResult);
  }

  // Wetter für ausgewählte Stadt abrufen
  async searchCityWeather(cityResult?: CityResult) {
    if (!this.city.trim()) return;
    
    this.loading = true;
    this.error = '';
    this.showSuggestions = false;
    
    try {
      let coords;
      if (cityResult) {
        // Koordinaten aus ausgewählter Stadt verwenden
        coords = { latitude: cityResult.latitude, longitude: cityResult.longitude };
        this.cityName = `${cityResult.name}, ${cityResult.country}`;
      } else {
        // Koordinaten der Stadt abrufen
        coords = await this.weather.getCoordinates(this.city);
        this.cityName = this.city;
      }
      
      // Wetterdaten für diese Koordinaten abrufen
      this.weatherData = await this.weather.getWeather(coords.latitude, coords.longitude);
    } catch (err) {
      console.error('Fehler beim Abrufen:', err);
      this.error = err instanceof Error ? err.message : 'Ein magischer Fehler ist aufgetreten! 🔮✨';
      this.weatherData = null;
    } finally {
      this.loading = false;
    }
  }

  // Standard Suche 
  async searchCity() {
    await this.searchCityWeather();
  }

  // Vorschläge ausblenden
  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Kurze Verzögerung, damit Klick auf Vorschlag noch funktioniert
  }

  // Verbesserte Wetterbeschreibungen mit Emojis
  getWeatherDescription(code: number): string {
    const weatherCodes: {[key: number]: string} = {
      0: 'Kristallklar',
      1: 'Überwiegend sonnig',
      2: 'Teilweise bewölkt',
      3: 'Bewölkt',
      45: 'Mystischer Nebel',
      48: 'Eisiger Nebel',
      51: 'Zarter Nieselregen',
      53: 'Sanfter Nieselregen',
      55: 'Kräftiger Nieselregen',
      61: 'Leichter Regenzauber',
      63: 'Moderater Regentanz',
      65: 'Intensiver Regensturm',
      71: 'Zarte Schneeflocken',
      73: 'Schneeverzauberung',
      75: 'Schneesturm-Magie',
      95: 'Donnernde Gewitter-Show',
    };
    
    return weatherCodes[code] || 'Geheimnisvolles Wetter';
  }

  getWeatherEmoji(code: number): string {
    const weatherEmojis: {[key: number]: string} = {
      0: '☀️',
      1: '🌤️',
      2: '⛅',
      3: '☁️',
      45: '🌫️',
      48: '🌫️',
      51: '🌦️',
      53: '🌧️',
      55: '🌧️',
      61: '🌦️',
      63: '🌧️',
      65: '⛈️',
      71: '🌨️',
      73: '❄️',
      75: '🌨️',
      95: '⚡',
    };
    
    return weatherEmojis[code] || '🌈';
  }
}
