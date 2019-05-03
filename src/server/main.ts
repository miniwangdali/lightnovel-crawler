import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import util from 'util';
import fs from 'fs';
import Epub from 'epub-gen';

let window: BrowserWindow;

interface EpubOptions {
  title: string,
  author: string,
  cover: string
  content: [],
  output: string,
  text?: string
};

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });
  window.loadFile(path.resolve(__dirname, '../../dist/index.html'));
  console.info('Launching window...');
}

const generateEpub = async (options: EpubOptions) => {
  try {
    if (options.text) {
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(options.output.replace('.epub', '.txt'), options.text);
      delete options.text;
    }
    await new Epub({
      ...options,
      version: 3,
      tocTitle: '目录',
      appendChapterTitles: false,
    });
  } catch (e) {
    console.error(e);
  }
};

ipcMain.on('create-epub', (event, options: EpubOptions) => {
  generateEpub(options);
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  app.quit();
});