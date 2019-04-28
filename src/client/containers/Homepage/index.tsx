import React from 'react';
import strings from '../../strings';
import { debounce, isEmpty, get } from 'lodash'
import path from 'path';
import util from 'util';
import fs from 'fs';
import { ipcRenderer } from 'electron';

import * as parser from '../../util/ContentParser';
import Skeleton from '../../components/Skeleton';

export interface HomepageState {
  targetURL: string,
  urlValue: string,
  iFrameDocument: HTMLDocument,
  title: string,
  author: string,
  contents: { data: string }[],
  analyzing: boolean,
  outputFolder: string,
  postBlocks: parser.PostBlock[]
};

class Homepage extends React.Component<any, HomepageState> {

  private targetIframe: React.RefObject<HTMLIFrameElement> = React.createRef<HTMLIFrameElement>();
  private scrollingTimer: number;
  private lastScrollTop: number;

  constructor(props: any) {
    super(props);
    this.state = {
      targetURL: '',
      urlValue: '',
      iFrameDocument: null,
      title: '',
      author: '',
      contents: [],
      analyzing: false,
      outputFolder: path.resolve(__dirname),
      postBlocks: []
    };
  }

  private onURLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ urlValue: e.target.value });
  };

  private onURLInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.setState({ targetURL: this.state.urlValue });
    }
  };

  private onURLGoToButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ targetURL: this.state.urlValue });
  };

  private onIframeChange = (e: React.ChangeEvent<HTMLIFrameElement>) => {
    this.setState({ urlValue: e.target.contentWindow.location.href });
  };

  private analyze = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ analyzing: true });
    const scrollingElement = this.targetIframe.current.contentWindow.document.scrollingElement;
    scrollingElement.scrollTop = 0;
    scrollingElement.scrollTo({
      top: scrollingElement.scrollHeight,
      behavior: 'smooth'
    });
    this.scrollingTimer = setInterval(debounce(this.scrollingListener, 50), 100) as unknown as number;
  };

  private scrollingListener = () => {
    if (this.targetIframe.current.contentWindow.document.scrollingElement.scrollTop === this.lastScrollTop) {
      clearInterval(this.scrollingTimer);
      this.setState({ iFrameDocument: this.targetIframe.current.contentWindow.document }, () => this.parseContent());
    }
    this.lastScrollTop = this.targetIframe.current.contentWindow.document.scrollingElement.scrollTop;
  };

  private parseContent = async () => {
    const { iFrameDocument } = this.state;
    try {
      const title = (iFrameDocument.querySelector('#thread_subject') as HTMLElement).innerText;
      const postlist = iFrameDocument.querySelector("div#wp div#ct div#postlist");
      const postBlocks = await parser.getPostBlocks(postlist);
      const author = parser.getAuthor(postBlocks[0].postContent);
      
      this.setState({
        title,
        author,
        postBlocks
      }, () => {
        this.setState({ analyzing: false });
      });
    } catch (e) {
      console.error(e);
      this.setState({ analyzing: false });
    }
  };

  private generateBook = async () => {
    try {
      const mkdir = util.promisify(fs.mkdir);
      const novelFolderPath = path.resolve(this.state.outputFolder, this.state.title);
      const imagesFolderPath = path.resolve(novelFolderPath, 'images')
      try {
        await mkdir(novelFolderPath);
      } catch (err) {
        console.warn(err);
      }
      try {
        await mkdir(imagesFolderPath);
      } catch (err) {
        console.warn(err);
      }
      await Promise.all(
        this.state.postBlocks.reduce<Promise<void>[]>((accu, b, i) => {
          const requests = b.images.map((image, j) => {
            return parser.downloadImage(image, path.resolve(imagesFolderPath, `${parser.getDoubleBitString(i)}-${parser.getDoubleBitString(j)}.png`));
          });
          return accu.concat(requests);
        }, [])
      );

      const contents = this.state.postBlocks.map(b => {
        parser.removeUselessImages(b.postContent);
        return {
          data: `<section>${b.postContent.innerHTML}</section>`
        };
      });
      const text = this.state.postBlocks.reduce((accu, b, i) => accu.concat(b.postContent.innerText), []);
      ipcRenderer.send('create-epub', {
        title: this.state.title,
        author: this.state.author,
        cover: get(this.state.postBlocks, '[0].images[0].targetSrc', ''),
        content: contents,
        output: path.resolve(novelFolderPath, `${this.state.title}.epub`),
        text
      });

    } catch (e) {
      console.error(e);
    }
  }

  private onMetadataInputChange(property: "author" | "title", event: React.ChangeEvent<HTMLInputElement>) {
    // @ts-ignore
    this.setState({ [property]: event.target.value });
  }

  private onFileInputClick: React.MouseEventHandler<HTMLInputElement> = event => {
    ((event.target as HTMLInputElement).nextSibling as HTMLInputElement).click();
  };

  private onSaveLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    this.setState({ outputFolder: get(input, 'files[0].path', this.state.outputFolder) });
  };

  render() {
    const {
      targetURL,
      urlValue,
      analyzing,
      title,
      author,
      postBlocks,
      outputFolder
    } = this.state;

    const unableToProcess = !this.targetIframe.current || !this.targetIframe.current.contentWindow.location.href.startsWith('https://www.lightnovel.cn/thread');

    return <div className="Homepage">
      <div className="Homepage__browser-container">
        <div className="url-container">
          <label className="label--url">{strings.Homepage.targetURL}</label>
          <input type="text"
            className="input--url"
            value={urlValue}
            onChange={this.onURLInputChange}
            onKeyDown={this.onURLInputKeyDown} />
          <button className="button--go-to"
            onClick={this.onURLGoToButtonClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z" />
            </svg>
          </button>
        </div>
        {targetURL.length > 0 &&
          <iframe ref={this.targetIframe}
            src={targetURL}
            onLoad={this.onIframeChange}
            className="iframe--target-page" />
        }
      </div>
      <div className="Homepage__action-container">
        <button disabled={unableToProcess}
          onClick={this.analyze}>
          {strings.Homepage.analyze}
        </button>
        {!isEmpty(postBlocks) &&
          <button onClick={this.generateBook}>
            {strings.Homepage.generate}
          </button>
        }
        <Skeleton className="skeleton--analyzing" active={analyzing} />
      </div>
      <div className="Homepage__input-container">
        <label className="label--meta-data">{strings.Homepage.chooseOutputFolder}</label>
        <input type="text" className="input--meta-data" value={outputFolder} readOnly onClick={this.onFileInputClick} />
        {
          // @ts-ignore
          <input className="input--meta-data"
            type="file"
            disabled={analyzing}
            webkitdirectory="true"
            multiple
            onChange={this.onSaveLocationChange} />
        }
      </div>
      <div className="Homepage__input-container">
        <label className="label--meta-data">{strings.keywords.title}</label>
        <input className="input--meta-data"
          type="text"
          disabled={analyzing}
          value={title}
          onChange={this.onMetadataInputChange.bind(this, 'title')} />
      </div>
      <div className="Homepage__input-container">
        <label className="label--meta-data">{strings.keywords.author}</label>
        <input className="input--meta-data"
          type="text"
          disabled={analyzing}
          value={author}
          onChange={this.onMetadataInputChange.bind(this, 'author')} />
      </div>
    </div>;
  }
}

export default Homepage;