import { Platform } from 'react-native';

/**
 * Storage Keys and Project Paths
 * Centrally managed paths and identifiers for storage and assets.
 */

// Storage identifiers (Paths to persistent data)
export const STORAGE_KEYS = {
  GLOBAL_DAYS: 'app_global_days_enabled',
  DARK_MODE: 'app_dark_mode_enabled',
  NOTIFICATIONS: 'app_notifications_enabled',
  BACKGROUND_TONE: 'app_background_tone',
  TEXT_TONE: 'app_text_tone',
  PRIMARY_COLOR: 'app_primary_color',
  SELECTED_YEAR: 'app_selected_year',
  MY_PEOPLE: '@nameday_schemas', // Key remains for backward compatibility
};

// Project Structure Constants (Relative to root)
export const PROJECT_PATHS = {
  ASSETS: 'assets',
  ANDROID_RES: 'android/app/src/main/res',
  IOS_APP_ICONSET: 'ios/nameday/Images.xcassets/AppIcon.appiconset',
  ICON_SOURCE: 'assets/app_icon_source.png',
};

/**
 * Platform specific asset helpers
 */
export const ASSET_HELPERS = {
  /**
   * Returns the URI for an image asset
   * @param path Relative path from project root
   */
  getAssetUri: (path: string) => {
    if (Platform.OS === 'android') {
      return `file:///android_asset/${path}`;
    }
    return path;
  },

  /**
   * Returns project absolute paths for tools/scripts
   * Note: This only works in Node.js environments (like tools/ scripts)
   */
  getProjectAbsolutePath: (subPath: string = '') => {
    // @ts-ignore
    const base = typeof process !== 'undefined' ? process.cwd() : '';
    return `${base}/${subPath}`;
  }
};

/**
 * Platform-specific path helper logic
 */
export const getLocalFilePath = (fileName: string, subDir?: string) => {
  const base = subDir ? `${subDir}/${fileName}` : fileName;
  if (Platform.OS === 'android') {
    return `file:///android_asset/${base}`;
  }
  return base;
};

/**
 * Tool-related path generator logic
 * (Mirroring logic used in external build tools)
 */
export const getAndroidMipmapPath = (mipmapName: string) => {
  return `${PROJECT_PATHS.ANDROID_RES}/${mipmapName}`;
};

export const getIosIconPath = (filename: string) => {
  return `${PROJECT_PATHS.IOS_APP_ICONSET}/${filename}`;
};
