import { ipcMain } from "electron";
import { getUIPath } from "./path-resolver.js";
import { pathToFileURL } from "url";
export function isDev() {
    return process.env.NODE_ENV === "development";
}
export function ipcMainHandle(key, handler) {
    ipcMain.handle(key, async (event) => {
        validateEventFrame(event.senderFrame);
        return await handler(event);
    });
}
export function ipcWebContentsSend(key, webContents, payload) {
    webContents.send(key, payload);
}
export function validateEventFrame(frame) {
    if (isDev() && new URL(frame.url).host === "localhost:5123") {
        return;
    }
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error("Malicious event");
    }
}
