import { SmartCityPerformance } from '@models/SmartCityPerformance'

/**
 * Returns the sum of all the children a node has
 * @param node the node to get child count of
 */
export function countAllChildren(node: SmartCityPerformance): number {
	let sum = 0
	if (node.children) {
		sum += node.children.length
		for (const child of node.children) {
			sum += countAllChildren(child)
		}
	}
	return sum
}
