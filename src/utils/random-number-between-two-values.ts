/**
 * @description Returns a random number between 2 values.
 * @param {number} [startValue=0] - Where you want the number to start.
 * @param {number} endValue - Where you want the number to end.
 * @returns {number} - Gives back the random number between 2 values.
 */
export const getRandomNumberBetweenTwoValues = (startValue: number = 0, endValue: number): number => {
    return Math.random() * (endValue - startValue) + startValue;
}