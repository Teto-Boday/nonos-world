// Windows app: opens the hosted Nono's World, stays in the tray so reminders keep working.
const { app, BrowserWindow, Tray, Menu, shell, nativeImage, session } = require("electron");
const path = require("path");
const URL = "https://teto-boday.github.io/nonos-world/app/";
let win, tray, quitting = false;
if (!app.requestSingleInstanceLock()) app.quit();
app.setAppUserModelId("world.nonos.app");
function create(show = true) {
  win = new BrowserWindow({ width: 460, height: 860, minWidth: 360, show, title: "Nono's World", icon: path.join(__dirname, "icon.png"), autoHideMenuBar: true, backgroundColor: "#fff6f9" });
  win.loadURL(URL);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.on("close", e => { if (!quitting) { e.preventDefault(); win.hide(); } });
}
app.on("second-instance", () => { if (win) { win.show(); win.focus(); } });
app.whenReady().then(async () => {
  await session.defaultSession.clearCache().catch(() => {});
  app.setLoginItemSettings({ openAtLogin: true, args: ["--hidden"] });
  create(!process.argv.includes("--hidden"));
  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, "icon.png")).resize({ width: 16, height: 16 }));
  tray.setToolTip("Nono's World");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "افتحي Nono's World", click: () => { win.show(); win.focus(); } },
    { label: "خروج", click: () => { quitting = true; app.quit(); } }
  ]));
  tray.on("click", () => { win.show(); win.focus(); });
});
app.on("before-quit", () => { quitting = true; });
