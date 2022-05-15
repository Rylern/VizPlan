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
		if (err) {
			utils.redirectWithMsg(err.message, res);
			return;
		}
		if (fields["area-name"] == "") {
			utils.redirectWithMsg("The area name was not specified", res);
			return;
		}
		fs.readFile(files.kpi_csv.filepath, 'utf8', (err, CSVData) => {
			if (err) {
				utils.redirectWithMsg(err.message, res);
				return;
			}

			fs.readFile(files.geojson.filepath, 'utf8', (err, GeoJSONData) => {
				if (err) {
					utils.redirectWithMsg(err.message, res);
					return;
				}

				const geoJSON = JSON.parse(GeoJSONData);
				if(!gjv.valid(geoJSON)){
					utils.redirectWithMsg("Invalid GeoJSON", res);
					return;
				}

				parse(CSVData, (err, output) => {
					try {
						if (err) throw err;
	
						const area = createArea(fields, geoJSON);
						createDatasetFromCSV(output, area);
						
						utils.redirectWithMsg("The area " + area.name + " has been added to the platform", res);
					} catch (error) {
						utils.redirectWithMsg(error.message, res);
					}
					
				});
			});
		});
	});
};

function createArea(fields, geoJSON) {
	const infoURL = path.join(BASE_URL, "info.json");
	const info = JSON.parse(fs.readFileSync(infoURL));
	const areas = info["areas"];
	const name = fields["area-name"];
	areas.forEach(area => {
		if (area.datasetname == name.toLowerCase()) {
			throw new Error("The area already exists");
		}
	});

	const newArea = {
		name: name,
		datasetname: name.toLowerCase(),
		geojson: geoJSON
	};
	areas.push(newArea);
	fs.writeFileSync(infoURL, JSON.stringify(info));
	return newArea;
}