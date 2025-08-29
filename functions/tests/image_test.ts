import { expect } from "chai";

// import * as image from '../src/functions/image/image'
import * as imageUtil from "../src/functions/image/imageUtil";
import * as constant from "../src/functions/image/constant";

// import * as constant from '../src/common/constant';
// import * as test_db_helper from './test_db_helper';

// const adminDB = test_db_helper.adminDB();

describe("Image function", () => {
  it("Image function, orderCounter test", async function () {
    const uid = "123";
    // cover
    const okPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    expect(imageUtil.validImagePath(okPath11, constant.matchImagePaths)).to.equal(true);

    const ngPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    expect(imageUtil.validImagePath(ngPath11, constant.matchImagePaths)).to.equal(false);

    // profile
    const okPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    expect(imageUtil.validImagePath(okPath12, constant.matchImagePaths)).to.equal(true);

    const ngPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile1.jpg`;
    expect(imageUtil.validImagePath(ngPath12, constant.matchImagePaths)).to.equal(false);

    const okPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    expect(imageUtil.validImagePath(okPath13, constant.matchImagePaths)).to.equal(true);

    const ngPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item2.jpg`;
    expect(imageUtil.validImagePath(ngPath13, constant.matchImagePaths)).to.equal(false);
  });

  it("should test getStorePath", function () {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    expect(imageUtil.getFirestorePath(path1)).to.equal("restaurants/0LHzyxxnKZ0eZs3bCaEx");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    expect(imageUtil.getFirestorePath(path2)).to.equal("restaurants/0LHzyxxnKZ0eZs3bCaEx");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    expect(imageUtil.getFirestorePath(path3)).to.equal("restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg");

    const ngPath1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    expect(imageUtil.getFirestorePath(ngPath1)).to.equal("");

    const ngPath2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile2.jpg`;
    expect(imageUtil.getFirestorePath(ngPath2)).to.equal("");
  });

  it("should test getStorePath", function () {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    expect(imageUtil.getImageId(path1)).to.equal("cover");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    expect(imageUtil.getImageId(path2)).to.equal("profile");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    expect(imageUtil.getImageId(path3)).to.equal("item");
  });

  it("should test getToFileFullPath", function () {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    expect(imageUtil.getToFileFullPath(path1, 100)).to.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/100/cover.jpg");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    expect(imageUtil.getToFileFullPath(path2, 200)).to.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/200/profile.jpg");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`;
    expect(imageUtil.getToFileFullPath(path3, 300)).to.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/123/resize/300/item.jpg");
  });
});
