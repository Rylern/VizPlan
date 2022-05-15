/**
 * Computes the text rotation angle for a node.
 * Text is flipped 180" if text is in 90-270* range
 * @param d node to get angle of
 */
export function getTextRotation(d: any) {
	const angle = ((d.x0 + d.x1) / Math.PI) * 90;
	const ancestors = d.ancestors();
	const root = ancestors[ancestors.length - 1];

	if (ancestors.length == 2 && root.height == 3) {
		return angle < 90 || angle > 270 ? angle : angle + 180
	}
	return angle < 180 ? angle - 90 : angle + 90
}
