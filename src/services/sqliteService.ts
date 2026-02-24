import SQLite from 'react-native-sqlite-storage';
import { NativeModules } from 'react-native';

// Enable promises for SQLite
SQLite.enablePromise(true);

const DB_NAME = 'appdata_v2.db';

let dbInstance: any = null;

// Diagnostics: check if native module exists
if (!NativeModules.SQLite) {
  console.error('SQLite Native Module not found!');
}

export const getDBConnection = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
      createFromLocation: 1, // Look in assets/www/
    });
    
    return dbInstance;
  } catch (error) {
    console.error('getDBConnection error:', error);
    throw error;
  }
};

export async function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const db = await getDBConnection();
    const result = await db.executeSql(query, params);
    const results = result[0];
    const rows = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }
    return rows as T[];
  } catch (error) {
    console.error(`SQLite query error (query: ${query}):`, error);
    return [];
  }
}
