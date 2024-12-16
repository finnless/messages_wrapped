import pkg from "electron-updater";
const { autoUpdater } = pkg;
import log from "electron-log";
export class AppUpdater {
    constructor() {
        // Configure logging
        log.transports.file.level = "debug";
        autoUpdater.logger = log;
        autoUpdater.setFeedURL({
            provider: "github",
            owner: "3eif",
            repo: "messages-wrapped-releases",
            private: true,
            token: "bro_you_really_shouldnt_put_your_pat_in_the_code_also_r_u_not_using_github_you_would_be_blocked_from_pushing_pats_if_you_were",
        });
        // Configure updater
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = true;
        // Check for updates
        autoUpdater.checkForUpdatesAndNotify();
    }
}
