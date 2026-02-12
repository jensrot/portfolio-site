/**
 * Converts a hex color string to an array of RGB values.
 *
 * @param {string} hex - The hex color code (e.g., "#FFFFFF" or "000000").
 * @returns {number[]} - An array containing the [red, green, blue] components (0-255).
 */
export const hexToRgb = (hex: string): number[] => {
    // Remove the "#" character from the beginning of the hex color code
    hex = hex.replace("#", "");

    // Convert the hex color code to an integer
    const hexInt = parseInt(hex, 16);

    // Extract the red, green, and blue components from the hex color code
    const red = (hexInt >> 16) & 255;
    const green = (hexInt >> 8) & 255;
    const blue = hexInt & 255;

    // Return an array of the RGB values
    return [red, green, blue];
}