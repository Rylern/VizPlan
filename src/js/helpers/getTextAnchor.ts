/**
 * Returns the text anchor for a text element.
 * If the elements has children, return middle.
 * else return start / end depending on the angle of the text.
 * @param d node to get text position on
 */
export function getTextAnchorByAngle(d: any) {
	const ancestors = d.ancestors();
	const root = ancestors[ancestors.length - 1];
	if (root.height != d.depth) {
		return 'middle';
	}
	const angle = ((d.x0 + d.x1) / Math.PI) * 90;
	return angle < 180 ? 'start' : 'end';
}
