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

  trackBySuggestion(index: number, item: CityResult): number {
    return item.id;
  }

  trackByForecast(index: number, item: string): number {
    return index;
  }

getWeatherClass(code: number): string {
  console.log('Weather Code:', code);
  
  const weatherMap = {
    0: 'sunny',
    1: 'sunny',
    2: 'sunny',
    
    3: 'cloudy',
    
    45: 'foggy',
    48: 'foggy',
    
    51: 'rainy',
    53: 'rainy',
    55: 'rainy',
    56: 'rainy',
    57: 'rainy',
    
    61: 'rainy',
    63: 'rainy',
    65: 'rainy',
    66: 'rainy',
    67: 'rainy',
    
    71: 'snowy',
    73: 'snowy',
    75: 'snowy',
    77: 'snowy',
    
    80: 'rainy',
    81: 'rainy',
    82: 'rainy',
    85: 'snowy',
    86: 'snowy',
    
    95: 'stormy',
    96: 'stormy',
    99: 'stormy',
  };
  
  return weatherMap[code as keyof typeof weatherMap] || 'sunny';
}

  onCityInput() {
    if (this.city.length >= 2) {
      this.searchSubject.next(this.city);
      this.showSuggestions = true;
    } else {
      this.citySuggestions = [];
      this.showSuggestions = false;
    }
  }

  async searchCities(query: string) {
    try {
      this.citySuggestions = await this.weather.searchCities(query);
    } catch (err) {
      console.error('Fehler bei Städtesuche:', err);
      this.citySuggestions = [];
    }
  }

  selectCity(cityResult: CityResult) {
    this.city = cityResult.name;
    this.showSuggestions = false;
    this.citySuggestions = [];
    this.searchCityWeather(cityResult);
  }

  async searchCityWeather(cityResult?: CityResult) {
    if (!this.city.trim()) return;
    
    this.loading = true;
    this.error = '';
    this.showSuggestions = false;
    
    try {
      let coords;
      if (cityResult) {
        coords = { latitude: cityResult.latitude, longitude: cityResult.longitude };
        this.cityName = `${cityResult.name}, ${cityResult.country}`;
      } else {
        coords = await this.weather.getCoordinates(this.city);
        this.cityName = this.city;
      }
      
      this.weatherData = await this.weather.getWeather(coords.latitude, coords.longitude);
    } catch (err) {
      console.error('Fehler beim Abrufen:', err);
      this.error = err instanceof Error ? err.message : 'Ein magischer Fehler ist aufgetreten! 🔮✨';
      this.weatherData = null;
    } finally {
      this.loading = false;
    }
  }

  async searchCity() {
    await this.searchCityWeather();
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

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
