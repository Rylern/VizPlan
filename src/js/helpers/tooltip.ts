import { colorScaleForValues, colorScaleForNoValues } from './Colors'
import { TargetAvailable } from '@models/SmartCityPerformance'
import { Tooltip } from '@models/Tootip'

export const tooltip: Array<Tooltip> = [
	{
		name: '95+ % of Target',
		colorValue: colorScaleForValues(96)!,
		targetAvailable: TargetAvailable.AVAILABLE,
	},
	{
		name: '66-95 % of Target',
		colorValue: colorScaleForValues(67)!,
		targetAvailable: TargetAvailable.AVAILABLE,
	},
	{
		name: '33-66 % of Target',
		colorValue: colorScaleForValues(34)!,
		targetAvailable: TargetAvailable.AVAILABLE,
	},
	{
		name: 'Less than 33 % of Target',
		colorValue: colorScaleForValues(30)!,
		targetAvailable: TargetAvailable.AVAILABLE,
	},
	{
		name: 'No Data or No Target',
		colorValue: colorScaleForNoValues(TargetAvailable.NO_TARGET),
		targetAvailable: TargetAvailable.NO_TARGET,
	},
	{
		name: 'Data Reported - No targets yet available',
		colorValue: colorScaleForNoValues(TargetAvailable.DATA_REPORTED),
		targetAvailable: TargetAvailable.DATA_REPORTED,
	},
]
