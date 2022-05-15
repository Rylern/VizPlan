import { InfoDataset } from '@models/InfoDataset';


export function initDefineKPI(infosDataset: InfoDataset) {
    const defineKpiWindow = document.getElementById("define_kpi_window") as HTMLElement;
    const openBtn = document.getElementById("btn_define_kpi") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("modal-close_define_kpi") as HTMLElement;
    const startingYear = document.getElementById("define_kpi_starting_year") as HTMLInputElement;
    const endingYear = document.getElementById("define_kpi_ending_year") as HTMLInputElement;
    const showCsvExample = document.getElementById("define_KPI_csv_example_show") as HTMLElement;
    const csvExample = document.getElementById("define_KPI_csv_example") as HTMLElement;
    const showKPIExample = document.getElementById("define_KPI_example_show") as HTMLElement;
    const kpiExample = document.getElementById("define_KPI_example") as HTMLElement;

    openBtn.onclick = () => {
        defineKpiWindow.style.display = "block";
        verticalScrollbar.style.display = "none";
    };

    closeBtn.onclick = () => {
        defineKpiWindow.style.display = "none";
    };
    window.addEventListener("click", function(event) {
        if (event.target == defineKpiWindow) {
            defineKpiWindow.style.display = "none";
        }
    });

    startingYear.value = endingYear.value = (new Date().getFullYear()).toString();

    csvExample.style.display = "none";
    showCsvExample.onclick= () => {
        if (csvExample.style.display == "none") {
            csvExample.style.display = "block";
            showCsvExample.innerHTML = "[hide]";
        } else {
            csvExample.style.display = "none";
            showCsvExample.innerHTML = "[show]";
        }
    };
    kpiExample.style.display = "none";
    showKPIExample.onclick= () => {
        if (kpiExample.style.display == "none") {
            kpiExample.style.display = "block";
            showKPIExample.innerHTML = "[hide]";
        } else {
            kpiExample.style.display = "none";
            showKPIExample.innerHTML = "[show]";
        }
    };
}