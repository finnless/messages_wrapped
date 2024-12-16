import { app, BrowserWindow, shell, dialog } from "electron";
import { isDev } from "./util.js";
import { resolvePath, getUIPath } from "./path-resolver.js";
import { ipcMainHandle } from "./util.js";
import permissions from "@messages-wrapped/permissions";
import native from "@messages-wrapped/native";
import { APP_URL, LEGAL_URL, PRIVACY_URL, TERMS_URL } from "./constants.js";
import { AppUpdater } from "./auto-updater.js";
// import { initialize } from "@aptabase/electron/main";
ipcMainHandle("request-full-disk-access", async () => {
    try {
        console.log("Requesting full disk access...");
        const status = permissions.getAuthStatus("full-disk-access");
        console.log("Current disk access status:", status);
        if (status === "authorized") {
            console.log("Already authorized");
            return true;
        }
        console.log("Asking for full disk access...");
        await permissions.askForFullDiskAccess();
        const newStatus = permissions.getAuthStatus("full-disk-access");
        console.log("New disk access status:", newStatus);
        return newStatus === "authorized";
    }
    catch (error) {
        console.error("Error requesting full disk access:", error);
        throw error;
    }
});
ipcMainHandle("check-permissions", async () => {
    const diskAccessStatus = permissions.getAuthStatus("full-disk-access");
    return { diskAccessStatus };
});
ipcMainHandle("fetch-stats", async (_event) => {
    try {
        const diskAccessStatus = permissions.getAuthStatus("full-disk-access");
        if (diskAccessStatus !== "authorized") {
            return {
                success: false,
                error: "Full disk access not granted",
            };
        }
        const hasContacts = native.hasContacts();
        if (!hasContacts) {
            dialog.showMessageBox({
                type: "warning",
                title: "No Contacts Found",
                message: "No contacts were found in your address book.",
                detail: "Your Messages Wrapped will be generated without contact information. Contact names will appear as phone numbers or email addresses.",
                buttons: ["Okay"],
                defaultId: 0,
            });
        }
        const result = await native.fetchStats(APP_URL);
        const parsed = JSON.parse(result);
        if (!parsed.success) {
            const { response } = await dialog.showMessageBox({
                type: "error",
                title: "Error Generating Stats",
                message: "Failed to generate your Messages Wrapped",
                detail: parsed.error?.message || "An unknown error occurred",
                buttons: ["Okay", "Report Issue"],
                defaultId: 0,
            });
            if (response === 1) {
                const errorDetails = parsed.error?.details
                    ? `\n\nError Details:\n${JSON.stringify(parsed.error.details, null, 2)}`
                    : "";
                const mailtoUrl = `mailto:support@messageswrapped.com?subject=${encodeURIComponent("Messages Wrapped Error Report")}&body=${encodeURIComponent(`I encountered an error while using Messages Wrapped:${errorDetails}`)}`;
                shell.openExternal(mailtoUrl);
            }
            return parsed;
        }
        console.log("Parsed timing:", parsed);
        if (parsed.timing) {
            console.log("Performance metrics:", parsed.timing);
        }
        return parsed;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        await dialog.showMessageBox({
            type: "error",
            title: "Error Generating Stats",
            message: "An unexpected error occurred",
            detail: errorMessage,
            buttons: ["Okay"],
            defaultId: 0,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
});
ipcMainHandle("open-legal", async () => {
    await shell.openExternal(LEGAL_URL);
});
ipcMainHandle("open-privacy", async () => {
    await shell.openExternal(PRIVACY_URL);
});
ipcMainHandle("open-terms", async () => {
    await shell.openExternal(TERMS_URL);
});
ipcMainHandle("get-chat-db-size", async () => {
    try {
        const size = await native.getChatDbSize();
        return size;
    }
    catch (error) {
        console.error("Error getting chat.db size:", error);
        return 0;
    }
});
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 550,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: resolvePath(),
            devTools: false,
        },
        vibrancy: "fullscreen-ui",
        titleBarStyle: "hidden",
        resizable: false,
        movable: true,
        title: "Messages Wrapped",
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    }
    else {
        mainWindow.loadFile(getUIPath());
    }
    mainWindow.webContents.openDevTools();
}
// initialize("A-US-4366889233");
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
new AppUpdater();
