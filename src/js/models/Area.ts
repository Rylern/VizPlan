interface Geometry {
    type: string;
    coordinates: number[];
}

interface GeoJson {
    type: "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "GeometryCollection" | "Feature" | "FeatureCollection";
    geometry: Geometry;
    bbox?: [number, number, number, number, number, number];
    properties?: any;
}

export interface Area {
	name: string;
	datasetname: string;
	geojson: GeoJson;
};