export const CHAT_DB_PATH = "Library/Application Support/Chat/chat.db";
export const ADDRESS_BOOK_PATH = "Library/Application Support/AddressBook";
export const APP_TITLE = "Messages Wrapped";
export const APP_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://messageswrapped.com";
export const LEGAL_URL = `${APP_URL}/legal`;
export const PRIVACY_URL = `${APP_URL}/legal/privacy`;
export const TERMS_URL = `${APP_URL}/legal/terms`;
