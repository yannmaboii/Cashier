import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class SheetsService {
  private readonly logger = new Logger(SheetsService.name);
  private sheets;
  private readonly spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  private readonly tabName = process.env.GOOGLE_SHEETS_TAB_NAME || 'Sheet1';

  constructor() {
    const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n',
    );

    const auth = new google.auth.JWT({
     email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendRows(rows: (string | number)[][]) {
    if (!this.spreadsheetId) {
      this.logger.warn(
        'GOOGLE_SHEETS_SPREADSHEET_ID belum diset di .env, sync dilewati',
      );
      return;
    }

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.tabName}!A:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });
    } catch (error: any) {
      this.logger.error(
        'Gagal sync ke Google Sheets: ' + (error.message || error),
      );
    }
  }
}