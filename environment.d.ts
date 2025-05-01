export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      ADMIN_ID: string;
      GOOGLE_SPREADSHEET_ID: string;
    }
  }
}

