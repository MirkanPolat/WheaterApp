import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  http = inject(HttpClient);

  async getCityWoeid(city: string): Promise<number> {
    const url = `https://www.metaweather.com/api/location/search/?query=${city}`;
    const result: any = await firstValueFrom(this.http.get(url));
    return result[0]?.woeid;
  }

  async getWeather(woeid: number): Promise<any> {
    const url = `https://www.metaweather.com/api/location/${woeid}/`;
    return await firstValueFrom(this.http.get(url));
  }
}