import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';
import process from 'process';
require('dotenv')

class GoogleSheets {
  private auth: JWT | null = null;
  private sheets = google.sheets('v4');
  private readonly spreadsheetId: string;

  constructor(spreadsheetId: string) {
    this.spreadsheetId = spreadsheetId;
  }

  async initialize(): Promise<void> {
    try {
      const keyFile = path.join(process.cwd(), 'service-account-credentials.json');

      this.auth = new JWT({
        keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      await this.auth.authorize();
      console.log('✅--Google Sheets API authenticated successfully');
    } catch (error) {
      console.error('❌--Error authenticating:', error);
      throw error;
    }
  }

  async getData<T extends any = string>(tableName: string, range: string): Promise<T[][]> {
    if (!this.auth) {
      throw new Error('❌--Not authenticated. Call initialize() first.');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${tableName}!${range}`,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('❌--Error fetching data:', error);
      throw error;
    }
  }

  async updateData<T extends any = string>(tableName: string, range: string, values: T[][]): Promise<void> {
    if (!this.auth) {
      throw new Error('❌--Not authenticated. Call initialize() first.');
    }

    try {
      await this.sheets.spreadsheets.values.update({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${tableName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      console.log('✅--Data updated successfully');
    } catch (error) {
      console.error('❌--Error updating data:', error);
      throw error;
    }
  }

  async appendData<T extends any = string>(tableName: string, range: string, values: T[][]): Promise<void> {
    if (!this.auth) {
      throw new Error('❌--Not authenticated. Call initialize() first.');
    }

    try {
      await this.sheets.spreadsheets.values.append({
        auth: this.auth,
        spreadsheetId: this.spreadsheetId,
        range: `${tableName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });

      console.log('✅--Data appended successfully');
    } catch (error) {
      console.error('❌--Error appending data:', error);
      throw error;
    }
  }
}

const googleSheets = new GoogleSheets(process.env.GOOGLE_SPREADSHEET_ID || '');

export { googleSheets };

