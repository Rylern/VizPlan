import { SmartCityPerformance, TargetAvailable } from '@models/SmartCityPerformance'

/**
 * Returns the average score of all the children scores upto the depth provided
 * @param node the node to get children scores of
 * @param depth how many sub children of children to go through, default = 1 = only direct children
 */
export function getAverageChildScores(node: SmartCityPerformance, depth: number = 1): number {
	depth -= 1
	let score = 0
	if (node.targetAvailable == TargetAvailable.AVAILABLE) {
		score += node.score ? node.score : 0
	}
	if (depth < 0) return score
	if (node.children) {
		for (const child of node.children) {
			score += getAverageChildScores(child, depth) / node.children.length
		}
		node.score = score
	}
	return score
}
