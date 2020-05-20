import * as imageUtil from './imageUtil';
import * as constant from './constant';

export const generateResizeImage = async (db, object) => {
  const filePath = object.name; // images/restaurants/0LHzyxxnKZ0eZs3bCaEx/cover.jpg
  const firestorePath = imageUtil.getFirestorePath(filePath);

  const imageId = imageUtil.getImageId(filePath);

  const resizedImages = {};
  await Promise.all(constant.sizeOfResize.map(async (size) => {

    const toFileFullPath = imageUtil.getToFileFullPath(filePath, size);
    const resizedImage = await imageUtil.resizedImage(object, toFileFullPath, size)
    return resizedImages[size] = resizedImage;
  }));

  if (Object.keys(resizedImages).length > 0) {
    await db.doc(firestorePath).set({
      images: {[imageId]:{
        original: filePath,
        resizedImages,
      }}
    }, {merge:true});
  }
  return true;
}

export const imageProcessing = async (db, object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg

  if (!contentType || !contentType.startsWith("image") || !filePath) {
    return false;
  }
  if (imageUtil.validImagePath(filePath, constant.matchImagePaths)) {
    return await generateResizeImage(db, object);
  } else {
    console.log("not hit", filePath);
    return false;
  }
}
