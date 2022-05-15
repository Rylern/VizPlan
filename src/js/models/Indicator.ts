import { SmartCityPerformance } from '@models/SmartCityPerformance';
import { Area } from './Area';

export interface Indicator {
    year: number;
    month?: string;
    area: Area;
    kpi: SmartCityPerformance;
}