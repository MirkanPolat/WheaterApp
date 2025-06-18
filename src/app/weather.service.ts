import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  http = inject(HttpClient);
  

  async getCoordinates(city: string): Promise<{latitude: number, longitude: number}> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const response = await firstValueFrom(this.http.get<any>(url));
    
    if (!response.results || response.results.length === 0) {
      throw new Error('Stadt nicht gefunden');
    }
    
    return {
      latitude: response.results[0].latitude,
      longitude: response.results[0].longitude
    };
  }
  
  // Wetterdaten abrufen
  async getWeather(latitude: number, longitude: number): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&current_weather=true`;
    return await firstValueFrom(this.http.get<any>(url));
  }
}