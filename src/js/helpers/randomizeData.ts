import { SmartCityPerformance, TargetAvailable } from '@models/SmartCityPerformance'
import { getAverageChildScores } from './averageScoreOfChildren'

export const randomizeData = (data: SmartCityPerformance): SmartCityPerformance => {
	function randomize(
		data: SmartCityPerformance,
		dataVailableForNode: TargetAvailable = TargetAvailable.AVAILABLE
	) {
		let noTarget = Math.random()
		let dataReported = Math.random()
		if (data.children) {
			data.score = undefined
			if (
				(noTarget < 0.03 || dataReported < 0.03) &&
				dataVailableForNode == TargetAvailable.AVAILABLE
			) {
				if (noTarget < dataReported) {
					dataVailableForNode = data.targetAvailable = TargetAvailable.NO_TARGET
				} else {
					dataVailableForNode = data.targetAvailable = TargetAvailable.DATA_REPORTED
				}
			}
			if (dataVailableForNode != TargetAvailable.AVAILABLE)
				data.targetAvailable = dataVailableForNode
			for (const iterator of data.children) {
				randomize(iterator, dataVailableForNode)
			}
			data.score = getAverageChildScores(data)
		} else if (data.score && !data.children) {
			if (
				(noTarget < 0.03 || dataReported < 0.03) &&
				dataVailableForNode == TargetAvailable.AVAILABLE
			) {
				if (noTarget < dataReported) {
					data.targetAvailable = TargetAvailable.NO_TARGET
				} else {
					data.targetAvailable = TargetAvailable.DATA_REPORTED
				}
				data.score = -1
			} else if (dataVailableForNode != 0) {
				data.targetAvailable = dataVailableForNode
			}
			let rnd = Math.random() * 100
			data.score = Number.parseInt(Math.min(100, Math.max(0, rnd)).toFixed(0))
		}
	}
	randomize(data)
	return data
}
