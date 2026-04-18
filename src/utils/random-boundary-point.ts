import { getRandomNumberBetweenTwoValues } from './random-number-between-two-values';

type Box = {
    x: number;
    y: number;
    width: number;
    height: number
};

/**
 * Returns a random point along one of the 4 edges of a bounding box,
 * placed inset pixels inside the boundary.
 *
 * @param {Box} box - The bounding box.
 * @param {number} inset - Margin in pixels to keep the point inside each edge.
 * @return {{ x: number; y: number }} - The random point object.
 */
export const getRandomBoundaryPoint = (box: Box, inset = 6): { x: number; y: number } => {
    const edge = Math.floor(Math.random() * 4);
    const minX = box.x + inset;
    const maxX = box.x + box.width - inset;
    const minY = box.y + inset;
    const maxY = box.y + box.height - inset;
    const randX = getRandomNumberBetweenTwoValues(minX, maxX);
    const randY = getRandomNumberBetweenTwoValues(minY, maxY);
    switch (edge) {
        case 0: return { x: randX, y: minY };   // top edge
        case 1: return { x: randX, y: maxY };   // bottom edge
        case 2: return { x: minX, y: randY };   // left edge
        default: return { x: maxX, y: randY };  // right edge
    }
};
