# Lightnovel Epub Crawler

## Introduction

The app can download lightnovels in the forum `https://www.lightnovel.cn`.

It will download images, text and save them as an epub.
The structure of the outputs is:
```
--<your_target_folder>
 |--<title>
   |--images
     |--<00-00>.png
     |--<00-01>.png
     |--<01-00>.png
      ...
   |--<title>.txt
   |--<title>.epub
```

**It is for personal use.**
I will improve it while I am using it.
So I am sorry that there is not a plan of the first reliable release. 

**PLEASE DO NOT SELL IT**

## How to use

1. Input the address of the target webpage in the input on the top. (Should be `https://www.lightnovel.cn/<thread>.html`)
2. Click `分析`(Analyze) and wait until you see another button `生成`(Generate)
3. Choose the output folder.
4. Edit the title and the author as needed. For example, you would like to remove `\` or any invalid character in the filename.
5. Click on `生成`(Generate) and wait shortly. You will see files generated in your output folder.

~*No error or success messages yet😔*~



## Develop

`npm install`

`npm run dev`

It will launch a electron window shortly.

## License
The MIT License
