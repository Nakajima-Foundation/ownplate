import * as admin from 'firebase-admin';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import sharp from 'sharp';
import UUID from "uuid-v4";

import * as constant from './constant';

const runSharp = async (bucket, fromFileFullPath, toFileFullPath, size, contentType) => {
  const tmpResizeFile = path.join(os.tmpdir(), UUID());

  try {
    // resize
    await sharp(fromFileFullPath).rotate()
      .resize(size, size, {
        fit: 'inside'
      }).toFile(tmpResizeFile);

    // upload
    const uuid = UUID();
    const ret = await bucket.upload(tmpResizeFile, {
      destination: toFileFullPath,
      metadata: {
        contentType: contentType,
        metadata: {
          firebaseStorageDownloadTokens: uuid
        }
      }
    });
    // generate public image url see: https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
    const file = ret[0];
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media&token=${uuid}`;
  } catch (e) {
    console.log("error", e);
  }
  return false;
}
export const downloadFileFromBucket = async (object) => {
  const bucketObj = admin.storage().bucket(object.bucket);
  const tempFilePath = path.join(os.tmpdir(), UUID());

  await bucketObj.file(object.name).download({destination: tempFilePath});
  console.log('Image downloaded locally to', tempFilePath);
  return tempFilePath;
};
export const resizedImage = async (object, toFileFullPath, size) => {
  const bucketObj = admin.storage().bucket(object.bucket);

  const fromTempFilePath = await downloadFileFromBucket(object);
  const ret = await runSharp(bucketObj, fromTempFilePath, toFileFullPath, size, object.contentType)

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  fs.unlinkSync(fromTempFilePath);
  return ret;
}

export const removeFile = async (object) => {
  const bucket = admin.storage().bucket(object.bucket);
  await bucket.file(object.name).delete();
}

export const validImagePath = (filePath, matchPaths) => {
  const filePaths = filePath.split("/");
  return matchPaths.reduce((ret, matchPath) => {
    const splitMatchPath = matchPath.path.split("/");
    return ret || ((Object.keys(splitMatchPath).reduce((match, key) => {
      if (match === false) {
        return false;
      }
      if (splitMatchPath[key] === "*") {
        return true;
      }
      return filePaths[Number(key)] === splitMatchPath[key]
    }, true)) && filePaths.length === splitMatchPath.length)
  }, false);
}

export const getFirestorePath = (filePath) => {
  const paths = filePath.split("/");
  if (validImagePath(filePath, [constant.coverPath, constant.profilePath])) {
    return paths.slice(1,3).join("/");
  }
  else if (validImagePath(filePath, [constant.menuItemPath])) {
    return paths.slice(1,5).join("/");
  }
  return "";
}

export const getImageId = (filePath) => {
  const paths = filePath.split("/");
  return paths[paths.length -1].split(".")[0];
};

export const getToFileFullPath = (filePath, size) => {
  // from aa/a.jpg -> to aa/resize/a_600.jpg
  const dirName = path.dirname(filePath) + "/resize";
  const fileName = path.basename(filePath);
  const thumbFileName = `${size}/${fileName}`;
  const toFileFullPath = path.join(dirName, thumbFileName);
  return toFileFullPath;
}
