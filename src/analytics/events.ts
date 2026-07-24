import { getClient } from './posthog';

/**
 * @description Records a custom event. A no-op when analytics is disabled or still loading,
 * @param {string} event - The name of the event to record.
 * @param {Record<string, unknown>} [properties] - Optional properties to associate with the event.
 * @returns {void} - This function does not return a value.
 */
export const track = (event: string, properties?: Record<string, unknown>): void => {
    getClient()?.capture(event, properties);
};
