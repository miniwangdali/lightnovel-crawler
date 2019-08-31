import React from "react";
import classnames from "classnames";
import strings from "../../strings";
import { debounce, isEmpty, get } from "lodash";
import path from "path";
import util from "util";
import fs from "fs";
import { ipcRenderer, shell } from "electron";

import * as parser from "../../util/ContentParser";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import Loading from "../../components/Loading";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addMessage } from "../../store/messages/actions";
import { Link } from "react-router-dom";
import { setImageList } from "../../store/images/actions";
import { ImageStateEntity } from "../../store/images/reducers";

const submitIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

interface HomepageProps {
  images: ImageStateEntity[];
  addMessage: Function;
  setImageList: Function;
}

export interface HomepageState {
  targetURL: string;
  urlValue: string;
  iFrameDocument: HTMLDocument;
  title: string;
  author: string;
  contents: { data: string }[];
  analyzing: boolean;
  outputFolder: string;
  postBlocks: parser.PostBlock[];
}

const name = "Homepage";

class Homepage extends React.Component<HomepageProps, HomepageState> {
  private targetIframe: React.RefObject<HTMLIFrameElement> = React.createRef<
    HTMLIFrameElement
  >();
  private scrollingTimer: number;
  private lastScrollTop: number;

  constructor(props: HomepageProps) {
    super(props);
    this.state = {
      targetURL: "",
      urlValue: "",
      iFrameDocument: null,
      title: "",
      author: "",
      contents: [],
      analyzing: false,
      outputFolder: path.resolve(__dirname),
      postBlocks: []
    };
    ipcRenderer.on("epub-created", () => {
      const targetFilePath = path.resolve(
        this.state.outputFolder,
        this.state.title
      );
      this.props.addMessage({
        title: strings.Homepage.createBookSuccess,
        description: (
          <button
            className={`${name}__openFileButton`}
            onClick={this.openTargetFile.bind(this, targetFilePath)}
          >
            {targetFilePath}
          </button>
        ),
        type: "success"
      });
    });
    ipcRenderer.on("create-epub-failed", (event, arg) => {
      this.props.addMessage({
        title: strings.Homepage.createBookError,
        description: arg,
        type: "error"
      });
    });
  }

  private onURLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ urlValue: e.target.value });
  };

  private onURLInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
    const scrollingElement = this.targetIframe.current.contentWindow.document
      .scrollingElement;
    scrollingElement.scrollTop = 0;
    scrollingElement.scrollTo({
      top: scrollingElement.scrollHeight,
      behavior: "smooth"
    });
    this.scrollingTimer = (setInterval(
      debounce(this.scrollingListener, 50),
      100
    ) as unknown) as number;
  };

  private scrollingListener = () => {
    const scrollingElement = this.targetIframe.current.contentWindow.document
      .scrollingElement;
    if (scrollingElement.scrollTop === this.lastScrollTop) {
      clearInterval(this.scrollingTimer);
      if (
        Math.ceil(scrollingElement.scrollTop + scrollingElement.clientHeight) >=
        scrollingElement.scrollHeight - 5
      ) {
        this.setState(
          { iFrameDocument: this.targetIframe.current.contentWindow.document },
          () => this.parseContent()
        );
        return;
      } else {
        scrollingElement.scrollTo({
          top: scrollingElement.scrollHeight,
          behavior: "smooth"
        });
        this.scrollingTimer = (setInterval(
          debounce(this.scrollingListener, 50),
          100
        ) as unknown) as number;
        return;
      }
    }
    this.lastScrollTop = this.targetIframe.current.contentWindow.document.scrollingElement.scrollTop;
  };

  private parseContent = async () => {
    const { iFrameDocument } = this.state;
    try {
      const title = (iFrameDocument.querySelector(
        "#thread_subject"
      ) as HTMLElement).innerText.replace("/", "-");
      const postlist = iFrameDocument.querySelector(
        "div#wp div#ct div#postlist"
      );
      const postBlocks = await parser.getPostBlocks(postlist);
      const images = postBlocks.reduce(
        (accu, value) => accu.concat(...value.images),
        []
      );
      this.props.setImageList(images.map(i => i.originalSrc));
      console.log(images);
      const author = parser.getAuthor(postBlocks[0].postContent);

      this.setState(
        {
          title,
          author,
          postBlocks
        },
        () => {
          this.setState({ analyzing: false });
        }
      );
    } catch (e) {
      this.props.addMessage({
        title: e.message,
        type: "error"
      });
      this.setState({ analyzing: false });
    }
  };

  private generateBook = async () => {
    try {
      this.setState({ analyzing: true });
      const mkdir = util.promisify(fs.mkdir);
      const novelFolderPath = path.resolve(
        this.state.outputFolder,
        this.state.title
      );
      const imagesFolderPath = path.resolve(novelFolderPath, "images");
      try {
        await mkdir(novelFolderPath);
      } catch (err) {
        this.props.addMessage({
          title: err.message,
          type: "warning"
        });
      }
      try {
        await mkdir(imagesFolderPath);
      } catch (err) {
        this.props.addMessage({
          title: err.message,
          type: "warning"
        });
      }
      await Promise.all(
        this.state.postBlocks.reduce<Promise<void>[]>((accu, b, i) => {
          const requests = b.images.map((image, j) => {
            return parser.downloadImage(
              image,
              path.resolve(
                imagesFolderPath,
                `${parser.getDoubleBitString(i)}-${parser.getDoubleBitString(
                  j
                )}.png`
              )
            );
          });
          return accu.concat(requests);
        }, [])
      );

      const contents = this.state.postBlocks.map((b, i) => {
        parser.removeUselessImages(b.postContent);
        return {
          title: b.postContent.innerText.trim().split(/[\r\n]/, 1)[0],
          data: `<section>${b.postContent.innerHTML.replace(
            /<br>\\*/g,
            "</p><p>"
          )}</section>`,
          beforeToc: i === 0
        };
      });
      const text = this.state.postBlocks.reduce(
        (accu, b, i) => accu.concat(b.postContent.innerText),
        []
      );
      ipcRenderer.send("create-epub", {
        title: this.state.title,
        author: this.state.author,
        cover: get(this.state.postBlocks, "[0].images[0].targetSrc", ""),
        content: contents,
        output: path.resolve(novelFolderPath, `${this.state.title}.epub`),
        text
      });
    } catch (e) {
      this.props.addMessage({
        title: e.message,
        type: "error"
      });
    }
    this.setState({ analyzing: false });
  };

  private onMetadataInputChange(
    property: "author" | "title",
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    // @ts-ignore
    this.setState({ [property]: event.target.value });
  }

  private onFileInputClick: React.MouseEventHandler<
    HTMLInputElement
  > = event => {
    (document.querySelector(
      "#file-input__output-folder"
    ) as HTMLInputElement).click();
  };

  private onSaveLocationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    this.setState({
      outputFolder: get(input, "files[0].path", this.state.outputFolder)
    });
  };

  public openTargetFile = (filepath: string) => {
    shell.openItem(filepath);
  };

  render() {
    const { images } = this.props;
    const {
      targetURL,
      urlValue,
      analyzing,
      title,
      author,
      postBlocks,
      outputFolder
    } = this.state;

    const unableToProcess =
      !this.targetIframe.current ||
      !this.targetIframe.current.contentWindow.location.href.startsWith(
        "https://www.lightnovel.cn/thread"
      );

    return (
      <React.Fragment>
        {<Loading active={analyzing} />}
        <div className={classnames(name, { loading: analyzing })}>
          <div className={`${name}__browser-container`}>
            <TextInput
              id="input__webpage-url"
              label={strings.Homepage.targetURL}
              hasSubmit={true}
              submitText={submitIcon}
              value={urlValue}
              onChange={this.onURLInputChange}
              onKeyDown={this.onURLInputKeyDown}
              onSubmit={this.onURLGoToButtonClick}
            />
            {targetURL.length > 0 && (
              <iframe
                ref={this.targetIframe}
                src={targetURL}
                onLoad={this.onIframeChange}
                className="iframe--target-page"
              />
            )}
          </div>
          <div className={`${name}__interface-container`}>
            <div className={`${name}__actions-container`}>
              <Button disabled={unableToProcess} onClick={this.analyze}>
                {strings.Homepage.analyze}
              </Button>
              {!isEmpty(postBlocks) && (
                <Button onClick={this.generateBook}>
                  {strings.Homepage.generate}
                </Button>
              )}
              {images.length > 0 && (
                <Button className="button--images-preview">
                  <Link to="/images-preview">
                    {strings.Homepage.imagePreview}
                  </Link>
                </Button>
              )}
            </div>
            <TextInput
              id="input__output-folder"
              label={strings.Homepage.chooseOutputFolder}
              value={outputFolder}
              readOnly
              onClick={this.onFileInputClick}
            />
            {
              // @ts-ignore
              <input
                id="file-input__output-folder"
                className="input--output-folder"
                type="file"
                disabled={analyzing}
                webkitdirectory="true"
                multiple
                onChange={this.onSaveLocationChange}
              />
            }
            <TextInput
              id="input__title"
              type="text"
              label={strings.keywords.title}
              disabled={analyzing}
              value={title}
              onChange={this.onMetadataInputChange.bind(this, "title")}
            />
            <TextInput
              id="input__author"
              label={strings.keywords.author}
              type="text"
              disabled={analyzing}
              value={author}
              onChange={this.onMetadataInputChange.bind(this, "author")}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  images: state.images.list
});

const mapDispatchToProps = dispatch => ({
  addMessage: bindActionCreators(addMessage, dispatch),
  setImageList: bindActionCreators(setImageList, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Homepage);
