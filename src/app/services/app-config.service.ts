import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfig } from '../models/app-config.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private settings: AppConfig | null = null;

  constructor(private readonly http: HttpClient) {}

  get config(): AppConfig {
    if (!this.settings) {
      throw new Error('La configuración aún no fue cargada.');
    }
    return this.settings;
  }

  async load(): Promise<AppConfig> {
    if (this.settings) {
      return this.settings;
    }

    const configFile = environment.nombre ? `assets/config-${environment.nombre}.json` : 'assets/config.json';
    const config = await firstValueFrom(this.http.get<AppConfig>(configFile));
    this.settings = config;
    return config;
  }
}
