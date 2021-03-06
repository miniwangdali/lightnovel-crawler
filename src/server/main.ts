import { app, BrowserWindow, ipcMain, IpcMessageEvent } from "electron";
import path from "path";
import util from "util";
import fs from "fs";
import Epub from "epub-gen";

let window: BrowserWindow;

interface EpubOptions {
  title: string;
  author: string;
  cover: string;
  content: [];
  output: string;
  text?: string;
}

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    },
    icon: path.resolve(__dirname, "../../build/icon.png")
  });
  // window.setMenu(null);
  window.loadFile(path.resolve(__dirname, "../../dist/index.html"));
  console.info("Launching window...");
}

const generateEpub = async (options: EpubOptions) => {
  try {
    if (options.text) {
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(options.output.replace(".epub", ".txt"), options.text);
      delete options.text;
    }
    return new Epub({
      ...options,
      version: 3,
      tocTitle: "目录",
      appendChapterTitles: false
    });
  } catch (e) {
    throw e;
  }
};

ipcMain.on(
  "create-epub",
  async (event: IpcMessageEvent, options: EpubOptions) => {
    try {
      await generateEpub(options);
      event.sender.send("epub-created");
    } catch (e) {
      event.sender.send("create-epub-failed", e.message);
    }
  }
);

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  app.quit();
});

if (process.env.NODE_ENV === "development") {
  fs.watchFile(
    path.resolve(__dirname, "../../dist/bundle.js"),
    { interval: 1000 },
    (curr, prev) => {
      window.reload();
      console.info("Window reloaded...");
    }
  );
}
