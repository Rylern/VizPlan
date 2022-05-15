
import { InfoDataset } from '@models/InfoDataset';
import { json } from 'd3';
import { SmartCityPerformance } from '@models/SmartCityPerformance';
import { Indicator } from '@models/Indicator';
import { DATASET_PATH, DATASET_EXT, indicators } from '../index';
import { Area } from '@models/Area';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const window = document.getElementById("progress_window") as HTMLElement;
const loadingBar = document.getElementById("loading") as HTMLProgressElement;

export async function getAllKPI(infosDataset: InfoDataset) {
    createProgressWindow();

    const years = infosDataset['years'];
    const areas = infosDataset['areas'];

    const indicators: Indicator[] = [];

    const numberOfIterations = years.length * (MONTHS.length+1) * areas.length;
    let currentNumberOfIterations = 0;

    for (let year of years) {
        for (let month of MONTHS) {
            for (let area of areas) {
                const url = DATASET_PATH + year + '/' + month + '/' + area.datasetname + DATASET_EXT;
                const kpi = await json<SmartCityPerformance>(url);
                if (kpi != undefined) {
                    indicators.push({
                        year: year,
                        month: month,
                        area: area,
                        kpi: kpi
                    });
                }
                updateLoadingBar(currentNumberOfIterations / numberOfIterations);
                currentNumberOfIterations++;
            }
        }

        for (let area of areas) {
            const url = DATASET_PATH + year + '/' + area.datasetname + DATASET_EXT;
            const kpi = await json<SmartCityPerformance>(url);
            if (kpi != undefined) {
                indicators.push({
                    year: year,
                    area: area,
                    kpi: kpi
                });
            }
            updateLoadingBar(currentNumberOfIterations / numberOfIterations);
            currentNumberOfIterations++;
        }
    }

    destroyProgressWindow();
    
    return indicators;
}

export function getKPI(year: number, area: Area, month?: string): SmartCityPerformance {
    for (let indicator of indicators) {
        if (indicator.year == year && indicator.area == area) {
            if (month && indicator.month == month) {
                return JSON.parse(JSON.stringify(indicator.kpi));
            } else if (!month && !indicator.month) {
                return JSON.parse(JSON.stringify(indicator.kpi));
            }
        }
    }
    return JSON.parse(JSON.stringify(""));
}

function createProgressWindow() {
    window.style.display = "block";
}

function destroyProgressWindow() {
    window.style.display = "none";
}

function updateLoadingBar(progress: number) {
    loadingBar.value = progress;
}