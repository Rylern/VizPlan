export function computeDistance(score1: number, score2: number, distanceSelected: String, minkowskiOrder: number) {
    if (score1 == -1 || score2 == -1) {
        return 0;
    }

    if (distanceSelected == "Manhattan") {
        return Math.abs(score1 - score2);
    } else if (distanceSelected == "Euclidian") {
        return (score1 - score2)**2;
    } else if (distanceSelected == "Minkowski") {
        return (Math.abs(score1 - score2))**minkowskiOrder;
    }
    return -1;
}
export function getTotalDistance(distance: number, distanceSelected: String, minkowskiOrder: number) {
    if (distanceSelected == "Manhattan") {
        return distance;
    } else if (distanceSelected == "Euclidian") {
        return Math.sqrt(distance);
    } else if (distanceSelected == "Minkowski") {
        return distance**(1/minkowskiOrder);
    }
    return -1;
}