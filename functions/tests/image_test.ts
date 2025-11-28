import { describe, it } from "node:test";
import assert from "node:assert";

// import * as image from '../src/functions/image/image'
import * as imageUtil from "../src/functions/image/imageUtil";
import * as constant from "../src/functions/image/constant";

// import * as constant from '../src/common/constant';
// import * as test_db_helper from './test_db_helper';

// const adminDB = test_db_helper.adminDB();

describe("Image function", () => {
  it("Image function, orderCounter test", async () => {
    const uid = "123";
    // cover
    const okPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    assert.strictEqual(imageUtil.validImagePath(okPath11, constant.matchImagePaths), true);

    const ngPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    assert.strictEqual(imageUtil.validImagePath(ngPath11, constant.matchImagePaths), false);

    // profile
    const okPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    assert.strictEqual(imageUtil.validImagePath(okPath12, constant.matchImagePaths), true);

    const ngPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile1.jpg`;
    assert.strictEqual(imageUtil.validImagePath(ngPath12, constant.matchImagePaths), false);

    const okPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    assert.strictEqual(imageUtil.validImagePath(okPath13, constant.matchImagePaths), true);

    const ngPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item2.jpg`;
    assert.strictEqual(imageUtil.validImagePath(ngPath13, constant.matchImagePaths), false);
  });

  it("should test getStorePath", () => {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    assert.strictEqual(imageUtil.getFirestorePath(path1), "restaurants/0LHzyxxnKZ0eZs3bCaEx");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    assert.strictEqual(imageUtil.getFirestorePath(path2), "restaurants/0LHzyxxnKZ0eZs3bCaEx");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    assert.strictEqual(imageUtil.getFirestorePath(path3), "restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg");

    const ngPath1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    assert.strictEqual(imageUtil.getFirestorePath(ngPath1), "");

    const ngPath2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile2.jpg`;
    assert.strictEqual(imageUtil.getFirestorePath(ngPath2), "");
  });

  it("should test getImageId", () => {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    assert.strictEqual(imageUtil.getImageId(path1), "cover");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    assert.strictEqual(imageUtil.getImageId(path2), "profile");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    assert.strictEqual(imageUtil.getImageId(path3), "item");
  });

  it("should test getToFileFullPath", () => {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    assert.strictEqual(imageUtil.getToFileFullPath(path1, 100), "images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/100/cover.jpg");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    assert.strictEqual(imageUtil.getToFileFullPath(path2, 200), "images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/200/profile.jpg");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    assert.strictEqual(imageUtil.getToFileFullPath(path3, 300), "images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/123/resize/300/item.jpg");
  });
});
