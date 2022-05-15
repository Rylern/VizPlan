import { InfoDataset, KPI } from '@models/InfoDataset';


export function initCreateArea(infosDataset: InfoDataset) {
    const years = infosDataset["years"];
    const KPIs = infosDataset["kpi"];
    const window = document.getElementById("add_areas_window") as HTMLElement;
    const openBtn = document.getElementById("btn_add_areas") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("modal-close_add_areas") as HTMLElement;
    const listYears = document.getElementById("list_years") as HTMLElement;
    const showKPIList = document.getElementById("show_KPI_list") as HTMLElement;
    const listKPI = document.getElementById("list_KPI") as HTMLElement;
    const showKPIExample = document.getElementById("show_KPI_example") as HTMLElement;
    const KPIExample = document.getElementById("KPI_example") as HTMLElement;
    const showGeoJSONExample = document.getElementById("show_GeoJSON_example") as HTMLElement;
    const GeoJSONExample = document.getElementById("GeoJSON_example") as HTMLElement;

    openBtn.onclick = () => {
        window.style.display = "block";
        verticalScrollbar.style.display = "none";
    };

    closeBtn.onclick = () => {
        window.style.display = "none";
    };
    window.addEventListener("click", function(event) {
        if (event.target == window) {
            window.style.display = "none";
        }
    });

    years.forEach(year => {
        listYears.innerHTML += "<li>" + year.toString() + "</li>";
    });

    listKPI.style.display = "none";
    showKPIList.onclick= () => {
        if (listKPI.style.display == "none") {
            listKPI.style.display = "block";
            showKPIList.innerHTML = "[hide]";
        } else {
            listKPI.style.display = "none";
            showKPIList.innerHTML = "[show]";
        }
    };
    
    KPIs.forEach(dimension => {
        listKPI.innerHTML += getKPIItem(dimension);
    });

    KPIExample.style.display = "none";
    showKPIExample.onclick = () => {
        if (KPIExample.style.display == "none") {
            KPIExample.style.display = "block";
            showKPIExample.innerHTML = "[hide]";
        } else {
            KPIExample.style.display = "none";
            showKPIExample.innerHTML = "[show]";
        }
    };
    GeoJSONExample.style.display = "none";
    showGeoJSONExample.onclick = () => {
        if (GeoJSONExample.style.display == "none") {
            GeoJSONExample.style.display = "block";
            showGeoJSONExample.innerHTML = "[hide]";
        } else {
            GeoJSONExample.style.display = "none";
            showGeoJSONExample.innerHTML = "[show]";
        }
    };
}

export function initEditArea(infosDataset: InfoDataset) {
    const areas = infosDataset["areas"];
    const years = infosDataset["years"];
    const KPIs = infosDataset["kpi"];
    const window = document.getElementById("edit_areas_window") as HTMLElement;
    const openBtn = document.getElementById("btn_edit_areas") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("modal-close_edit_areas") as HTMLElement;
    const list_areas = document.getElementById("edit_list_areas") as HTMLSelectElement;

    openBtn.onclick = () => {
        window.style.display = "block";
        verticalScrollbar.style.display = "none";
    };

    closeBtn.onclick = () => {
        window.style.display = "none";
    };
    window.addEventListener("click", function(event) {
        if (event.target == window) {
            window.style.display = "none";
        }
    });

    areas.forEach(area => {
        list_areas.innerHTML += "<option>" + area.name + "</option>";
    });
}

export function initRemoveArea(infosDataset: InfoDataset) {
    const openBtn = document.getElementById("btn_remove_areas") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("modal-close_remove_areas") as HTMLElement;
    const window = document.getElementById("remove_areas_window") as HTMLElement;
    const list_areas = document.getElementById("list_areas") as HTMLSelectElement;
    const areas = infosDataset["areas"];

    openBtn.onclick = () => {
        window.style.display = "block";
        verticalScrollbar.style.display = "none";
    };

    closeBtn.onclick = () => {
        window.style.display = "none";
    };
    window.addEventListener("click", function(event) {
        if (event.target == window) {
            window.style.display = "none";
        }
    });

    areas.forEach(area => {
        list_areas.innerHTML += "<option>" + area.name + "</option>";
    });
}

function getKPIItem(dimension: KPI) {
    let line = "<li>" + dimension.name;
    if (dimension["children"] != null) {
        line += "<ul>";
        dimension["children"]?.forEach(subDimension => {
            line += getKPIItem(subDimension);
        });
        line += "</ul>";
    }
    line += "</li>";
    return line;
}