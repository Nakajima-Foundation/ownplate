import { should } from 'chai';
// import { expect } from 'chai';

// import * as image from '../src/functions/image/image'
import * as imageUtil from '../src/functions/image/imageUtil';
import * as constant from '../src/functions/image/constant';

// import * as constant from '../src/common/constant';
// import * as test_db_helper from './test_db_helper';

// const adminDB = test_db_helper.adminDB();

should()

describe('Image function', () => {
  it ('Image function, orderCounter test', async function() {
    const uid = "123";
    // cover
    const okPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    imageUtil.validImagePath(okPath11, constant.matchImagePaths).should.equal(true);


    const ngPath11 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    imageUtil.validImagePath(ngPath11, constant.matchImagePaths).should.equal(false);

    // profile
    const okPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    imageUtil.validImagePath(okPath12, constant.matchImagePaths).should.equal(true);

    const ngPath12 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile1.jpg`;
    imageUtil.validImagePath(ngPath12, constant.matchImagePaths).should.equal(false);

    const okPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`
    imageUtil.validImagePath(okPath13, constant.matchImagePaths).should.equal(true);

    const ngPath13 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item2.jpg`
    imageUtil.validImagePath(ngPath13, constant.matchImagePaths).should.equal(false);
  });

  it('should test getStorePath', function() {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    imageUtil.getFirestorePath(path1).should.equal(`restaurants/0LHzyxxnKZ0eZs3bCaEx`);

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    imageUtil.getFirestorePath(path2).should.equal(`restaurants/0LHzyxxnKZ0eZs3bCaEx`);

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`
    imageUtil.getFirestorePath(path3).should.equal(`restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg`);

    const ngPath1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover1.jpg`;
    imageUtil.getFirestorePath(ngPath1).should.equal("");

    const ngPath2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile2.jpg`;
    imageUtil.getFirestorePath(ngPath2).should.equal("");

  });

  it('should test getStorePath', function() {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    imageUtil.getImageId(path1).should.equal("cover");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    imageUtil.getImageId(path2).should.equal("profile");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`
    imageUtil.getImageId(path3).should.equal("item");


  });

  it('should test getToFileFullPath', function() {
    const uid = "123";
    const path1 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/cover.jpg`;
    imageUtil.getToFileFullPath(path1, 100).should.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/100/cover.jpg");

    const path2 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/${uid}/profile.jpg`;
    imageUtil.getToFileFullPath(path2, 200).should.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/123/resize/200/profile.jpg");

    const path3 = `images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/${uid}/item.jpg`
    imageUtil.getToFileFullPath(path3, 300).should.equal("images/restaurants/0LHzyxxnKZ0eZs3bCaEx/menus/6cDoe8lyrn898YtwiQfg/123/resize/300/item.jpg");
  });

})
