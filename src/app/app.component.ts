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
    // Debounce für die Suche - wartet 300ms nach der letzten Eingabe
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.searchCities(query);
    });
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
      console.log(this.weatherData); // Zum Debuggen
    } catch (err) {
      console.error('Fehler beim Abrufen:', err);
      this.error = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten';
      this.weatherData = null;
    } finally {
      this.loading = false;
    }
  }

  // Standard-Suche (Enter oder Button)
  async searchCity() {
    await this.searchCityWeather();
  }

  // Vorschläge ausblenden
  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200); // Kurze Verzögerung, damit Klick auf Vorschlag noch funktioniert
  }

  // Wettercode in lesbaren Text umwandeln
  getWeatherDescription(code: number): string {
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
