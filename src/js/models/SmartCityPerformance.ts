/**
 * The format of the JSON data for the Smart City KPI values.
 * All Dimensions, Cetegories and KPIs require a name and a targetAvailability
 * while score, childrens are optional.
 */
export type SmartCityPerformance = {
	name: string
	score?: number
	children?: Array<SmartCityPerformance>
	targetAvailable: TargetAvailable
}

export enum TargetAvailable {
	AVAILABLE = 0,
	DATA_REPORTED = 1,
	NO_TARGET = 2,
}
