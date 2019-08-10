"use strict";

import fs from "fs";
import util from "util";
import { map, forEach, filter, get } from "lodash";
import keywords from "../keywords";

const imgParentTagName = "ignore_js_op";
const imgZoomClassName = "zoom";
export interface Image {
  originalImgElement: HTMLImageElement;
  targetImgElement: HTMLImageElement;
  originalSrc: string;
  targetSrc: string;
}

export interface PostBlock {
  images: Image[];
  postContent: HTMLElement;
}

export const getAuthor = (content: HTMLElement) => {
  const text = content.innerText.trimEnd();
  const authorIndex = text.indexOf(keywords.author);
  if (authorIndex < 0) return "";
  try {
    const author = text
      .substring(authorIndex + keywords.author.length + 1)
      .split(/\r\n|\r|\n/g)[0]
      .trim();
    return author;
  } catch (e) {
    console.error(e);
    return "";
  }
};

const hasPostscript = (text: string) => {
  for (let i = 0; i < keywords.postscript.length; i++) {
    if (text.startsWith(keywords.postscript[i])) return true;
  }
  return false;
};

export const getPostBlocks = async (postlist: Element) => {
  const blockDivElements = filter(postlist.children, div =>
    div.id.startsWith("post_")
  );
  const postBlocks: PostBlock[] = [];
  for (let i = 0; i < blockDivElements.length; i++) {
    const postContent = getPostContent(blockDivElements[i]);
    if (postContent.innerText.trim().length < 50) break;
    const images = getImages(postContent);
    forEach(
      postContent.getElementsByClassName(imgZoomClassName),
      (target: HTMLElement, i: number) => {
        target.insertAdjacentElement("beforebegin", images[i].targetImgElement);
      }
    );
    postBlocks.push({
      images,
      postContent
    });
    if (hasPostscript(postContent.innerText.trim())) break;
  }

  return postBlocks;
};

export const removeIgnoreJSOP = (content: Element) => {
  try {
    forEach(
      content.getElementsByTagName(imgParentTagName),
      (target: HTMLElement) => {
        target.remove();
      }
    );
  } catch {
    removeIgnoreJSOP(content);
  }
};

export const removeUselessImages = (content: Element) => {
  try {
    forEach(content.getElementsByTagName("img"), (target: HTMLElement) => {
      if (!target.classList.contains("duokan-image-single")) {
        target.remove();
      }
    });
  } catch {
    removeUselessImages(content);
  }
};

export const getPostContent = (block: Element) => {
  const content = block.querySelector(
    "table tbody tr td.plc div.pct div.pcb div.t_fsz table tbody tr td.t_f"
  );
  // Remove edition status info
  const statusElements = content.getElementsByClassName("pstatus");
  forEach(statusElements, e => e.remove());
  return <HTMLElement>content;
};

export const getImages = (content: Element): Image[] => {
  const imgElements = content.getElementsByClassName(imgZoomClassName);
  return map(imgElements, i => {
    const originalImgElement =
      i.querySelector("img") || (i as HTMLImageElement);
    const targetImgElement = document.createElement("img");
    targetImgElement.classList.add("duokan-image-single");
    return {
      originalImgElement,
      targetImgElement,
      originalSrc: get(originalImgElement, "src", null),
      targetSrc: ""
    };
  });
};

export const downloadImage = async (
  image: Image,
  fileName: string = "image.png"
) => {
  try {
    console.info("Downloading image from: ", image.originalSrc);
    const buffer = await fetch(image.originalSrc).then(response =>
      response.arrayBuffer()
    );
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(fileName, Buffer.from(buffer));
    image.targetImgElement.src = fileName;
    image.targetSrc = fileName;
  } catch (e) {
    console.error(e);
  }
};

export const getDoubleBitString = (n: number) => {
  if (n < 10) {
    return `0${n}`;
  }
  return `${n}`;
};
