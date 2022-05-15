import { scaleThreshold, scaleOrdinal } from 'd3'

const colorsForValues = ['#d17d52', '#d8ae56', '#72b282', '#459a71']
const colorsForNoValues = ['#609fba', '#89817b']

const domainForValues = [33, 66, 95]
const domainForNoValues = [1, 2]

const colorScaleForValues = scaleThreshold<number, string>()
	.domain(domainForValues)
	.range(colorsForValues)

const colorScaleForNoValues = scaleOrdinal<number, string>()
	.domain(domainForNoValues)
	.range(colorsForNoValues)

export { colorScaleForNoValues, colorScaleForValues }
