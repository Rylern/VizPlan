const formidable = require('formidable');
const fs = require('fs');
const parse = require('csv-parse');
const path = require('path');
const gjv = require("geojson-validation");
const utils = require('./utils');
const createDatasetFromCSV = require('./createDatasetFromCSV');

const BASE_URL = path.join(__dirname, 'public', 'kpi');


module.exports = (req, res) => {
	const form = formidable({ multiples: true });
	
	form.parse(req, (err, fields, files) => {
		try {
			if (err) {
				throw err;
			}
			const areaName = fields["list_areas"];

			if (files.geojson.originalFilename != "") {
				const GeoJSONData = fs.readFileSync(files.geojson.filepath, 'utf8');
	
				const geoJSON = JSON.parse(GeoJSONData);
				if(!gjv.valid(geoJSON)){
					utils.redirectWithMsg("The GeoJSON file has an invalid format.", res);
					return;
				}
				editArea(areaName, geoJSON);
			}
			if (files.kpi_csv.originalFilename != "") {
				const data = fs.readFileSync(files.kpi_csv.filepath, 'utf8');
				parse(data, function(err, output) {
					try {
						if (err) throw err;
	
						createDatasetFromCSV(output, findArea(areaName), true);
						utils.redirectWithMsg("The area " + areaName + " was modified", res);
					} catch (error) {
						utils.redirectWithMsg(error.message, res);
					}
				});
			} else {
				utils.redirectWithMsg("The area " + areaName + " was modified", res);
			}
		} catch (error) {
			utils.redirectWithMsg(error.message, res);
		}
	});
};

function editArea(name, geoJSON) {
	const infoURL = path.join(BASE_URL, "info.json");
	const info = JSON.parse(fs.readFileSync(infoURL));
	const areas = info["areas"];

	const area = findArea(name, areas);
	area.geojson = geoJSON;

	fs.writeFileSync(infoURL, JSON.stringify(info));
}

function findArea(areaName, areas) {
	if (areas == undefined) {
		const infoURL = path.join(BASE_URL, "info.json");
		const info = JSON.parse(fs.readFileSync(infoURL));
		areas = info["areas"];
	}

	let area;
	areas.forEach(a => {
		if (a.name == areaName) {
			area = a;
		}
	});
	if (area == undefined) {
		throw new Error("The area does not exist");
	}
	return area;
}