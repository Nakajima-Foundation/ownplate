import * as admin from "firebase-admin";

import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";
import UUID from "uuid-v4";

import * as constant from "./constant";

const runSharp = async (bucket: ReturnType<ReturnType<typeof admin.storage>["bucket"]>, fromFileFullPath: string, toFileFullPath: string, size: number, contentType: string) => {
  const tmpResizeFile = path.join(os.tmpdir(), UUID());

  try {
    // resize
    await sharp(fromFileFullPath)
      .rotate()
      .resize(size, size, {
        fit: "inside",
      })
      .toFile(tmpResizeFile);

    // upload
    const uuid = UUID();
    const ret = await bucket.upload(tmpResizeFile, {
      destination: toFileFullPath,
      metadata: {
        contentType: contentType,
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });
    // generate public image url see: https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
    const file = ret[0];
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;
  } catch (e) {
    console.log("error", e);
  }
  return false;
};
export const downloadFileFromBucket = async (data: { bucket: string; name: string }) => {
  const bucketObj = admin.storage().bucket(data.bucket);
  const tempFilePath = path.join(os.tmpdir(), UUID());

  await bucketObj.file(data.name).download({ destination: tempFilePath });
  console.log("Image downloaded locally to", tempFilePath);
  return tempFilePath;
};
export const resizedImage = async (data: { bucket: string; name: string; contentType: string }, toFileFullPath: string, size: number) => {
  const bucketObj = admin.storage().bucket(data.bucket);

  const fromTempFilePath = await downloadFileFromBucket(data);
  const ret = await runSharp(bucketObj, fromTempFilePath, toFileFullPath, size, data.contentType);

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  fs.unlinkSync(fromTempFilePath);
  return ret;
};

export const removeFile = async (data: { bucket: string; name: string }) => {
  const bucket = admin.storage().bucket(data.bucket);
  await bucket.file(data.name).delete();
};

export const validImagePath = (filePath: string, matchPaths: Array<{ path: string }>) => {
  const filePaths = filePath.split("/");
  return matchPaths.reduce((ret: boolean, matchPath: { path: string }) => {
    const splitMatchPath = matchPath.path.split("/");
    return (
      ret ||
      (Object.keys(splitMatchPath).reduce((match, key) => {
        if (match === false) {
          return false;
        }
        if (splitMatchPath[key] === "*") {
          return true;
        }
        return filePaths[Number(key)] === splitMatchPath[key];
      }, true) &&
        filePaths.length === splitMatchPath.length)
    );
  }, false);
};

export const getFirestorePath = (filePath: string) => {
  const paths = filePath.split("/");
  if (validImagePath(filePath, [constant.coverPath, constant.profilePath])) {
    return paths.slice(1, 3).join("/");
  } else if (validImagePath(filePath, [constant.menuItemPath])) {
    return paths.slice(1, 5).join("/");
  }
  return "";
};

export const getImageId = (filePath: string) => {
  const paths = filePath.split("/");
  return paths[paths.length - 1].split(".")[0];
};

export const getToFileFullPath = (filePath: string, size: number) => {
  // from aa/a.jpg -> to aa/resize/a_600.jpg
  const dirName = path.dirname(filePath) + "/resize";
  const fileName = path.basename(filePath);
  const thumbFileName = `${size}/${fileName}`;
  const toFileFullPath = path.join(dirName, thumbFileName);
  return toFileFullPath;
};
