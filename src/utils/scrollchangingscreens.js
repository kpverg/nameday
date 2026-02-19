/**
 * Utility for managing scroll timings and screen identity constants
 * to ensure smooth transitions between screens.
 */

export const SCREEN_IDS = {
  MAIN: 'main_screen',
  WEEK: 'week_screen',
  TOTAL_CELEBRATIONS: 'total_celebrations_screen',
  MY_PEOPLE: 'my_people_screen',
  SETTINGS: 'settings_screen',
  SEARCH: 'search_screen',
};

export const SCROLL_DELAYS = {
  SHORT: 50,      // Fast Jumps
  MEDIUM: 100,    // Standard Screen Transitions
  LONG: 300,      // Heavy Content Loading (e.g. Month List)
  REBOOT: 500,    // Full Refresh or Permission Changes
};

/**
 * Helper to wait for a specific duration (ms)
 * @param {number} ms - Milliseconds to wait
 */
export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
    SCREEN_IDS,
    SCROLL_DELAYS,
    waitFor,
};
