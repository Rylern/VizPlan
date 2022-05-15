import { HierarchyRectangularNode, arc } from 'd3';

// This module calculates the sizes of each arc of the sunburst.
export const sunburstArc = (scale = false) => {
	// Uses any type, as it does not depend on the generic type
	return arc<HierarchyRectangularNode<any>>()
		.startAngle(function (d) {
			return d.x0;
		})
		.endAngle(function (d) {
			return d.x1;
		})
		.innerRadius(function (d) {
			const ancestors = d.ancestors();
			const root = ancestors[ancestors.length - 1];
			if (scale && root.height == 3) {
				if (d.depth == 3) return d.y0 * 1.1;
				if (d.depth == 2) return d.y0 * 0.8;
			}
			return d.y0;
		})
		.outerRadius(function (d) {
			const ancestors = d.ancestors();
			const root = ancestors[ancestors.length - 1];
			if (scale && root.height == 3) {
				if (d.depth == 3) return d.y1 * 0.9;
				if (d.depth == 2) return d.y1 * 1.1;
				if (d.depth == 1) return d.y1 * 0.8;
			}
			return d.y1;
		});
};