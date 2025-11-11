// types/praytime.d.ts

declare module "praytime" {
  export interface TuneSettings {
    [key: string]: string | number;
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    sunset?: number;
    maghrib?: number;
    isha?: number;
    midnight?: number;
  }

  export interface PrayTimeSettings {
    fajr?: number | string;
    isha?: number | string;
    maghrib?: number | string;
    midnight?: string;
    dhuhr?: string;
    asr?: string;
    highLats?: "None" | "NightMiddle" | "OneSeventh" | "AngleBased";
    tune?: TuneSettings;
    format?: "24h" | "12h" | "12H" | "x" | "X" | ((timestamp: number) => string);
    rounding?: "nearest" | "up" | "down" | "none";
    utcOffset?: number | "auto";
    timezone?: string;
    location?: [number, number];
    iterations?: number;
  }

  export interface PrayerTimes {
    fajr: string ;
    sunrise: string;
    dhuhr: string;
    asr: string;
    sunset: string;
    maghrib: string;
    isha: string;
    midnight: string;
    [key: string]: string;
  }

  export class PrayTime {
    constructor(method?: string);
    method(method: string): this;
    adjust(params: Partial<PrayTimeSettings>): this;
    location(location: [number, number]): this;
    timezone(timezone: string): this;
    utcOffset(offset?: number | "auto"): this;
    tune(tune: TuneSettings): this;
    round(rounding?: "nearest" | "up" | "down" | "none"): this;
    format(format: PrayTimeSettings["format"]): this;
    set(settings: Partial<PrayTimeSettings>): this;
    times(date?: Date | number | [number, number, number]): PrayerTimes;
    getTimes(
      date?: Date | number | [number, number, number],
      location?: [number, number],
      timezone?: number | "auto",
      dst?: number,
      format?: PrayTimeSettings["format"]
    ): PrayerTimes;
  }

  export default PrayTime;
}
