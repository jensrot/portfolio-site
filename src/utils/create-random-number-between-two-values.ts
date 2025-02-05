/**
 * Create a random number between 2 values.
 *
 * @param {Number} startValue - Where you want the number to start.
 * @param {Number} endValue - Where you want the number to end.
 * @return {Number} - Gives back the random number between 2 values. 
 */
export const createRandomNumberBetweenTwoValues = (startValue: number = 0, endValue: number): number => {
    return Math.random() * (endValue - startValue) + startValue;
}