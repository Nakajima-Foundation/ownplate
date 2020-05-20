import * as admin from 'firebase-admin';

import * as imageUtil from './imageUtil';
import * as constant from './constant';

export const generateThumbnail = async (db, object) => {
  const filePath = object.name; // images/restaurants/0LHzyxxnKZ0eZs3bCaEx/cover.jpg
  const firestorePath = imageUtil.getFirestorePath(filePath);

  // just image. create thumbnail
  const imageId = imageUtil.getImageId(filePath);

  const thumbnails = {};
  await Promise.all(constant.thumbnailSizes.map(async (size) => {

    const toFileFullPath = imageUtil.getToFileFullPath(filePath, size);
    const thumbnail = await imageUtil.createResizedImage(object, toFileFullPath, size)
    return thumbnails[size] = thumbnail;
  }));

  if (Object.keys(thumbnails).length > 0) {
    const image_data_ref = db.doc(firestorePath);
    const data = {[imageId]:{
      original: filePath,
      thumbnails: thumbnails
    }};
    await image_data_ref.set({images: data}, {merge:true})
  }
  return true
}


export const deleteImage = async (snapshot, context) => {
  const { groupId, articles, articleId, sectionId } = context.params;
  const bucket = admin.storage().bucket();
  const path = `groups/${groupId}/${articles}/${articleId}/${sectionId}`;
  const pathThumbs = `groups/${groupId}/${articles}/${articleId}/thumb_${sectionId}`;
  if (!(articles === "articles" || articles === "pages")) {
    console.log("unexpected", articles);
    return false;
  }
  try {
    await bucket.deleteFiles({prefix:path});
    await bucket.deleteFiles({prefix:pathThumbs});
    console.log("deleting section images succeeded:", path);
  } catch(error) {
    console.log("deleting section images failed:", path, error);
  }
  return true;
}

export const imageProcessing = async (db, object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg

  if (!contentType || !contentType.startsWith("image")) {
    return false;
  }
  if (!filePath) {
    return false;
  }
  if (imageUtil.validImagePath(filePath, constant.matchImagePaths)) {
    return await generateThumbnail(db, object);
  } else {
    console.log("not hit", filePath);
    return false;
  }
}
