import { Area } from '@models/Area';

export interface KPI {
    name: string;
    children?: KPI[];
};

export interface InfoDataset {
	years: number[];
	kpi: KPI[];
	areas: Area[];
};