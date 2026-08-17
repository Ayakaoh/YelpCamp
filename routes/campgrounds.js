const express = require('express');
const router = express.Router();
const campgrounds = require ('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer')//アップロードに関するミドルウェア//引数にミドルウェア入れて、そのさらに引数にフィールド名(formにおけるname)
const { storage } = require('../cloudinary');//自動的にindex.jsを見る
const upload = multer({ storage })//アップロード先。{}の中に画像が入る（用意したstrage（cloudinary）に保存してね）

router.route('/')
    .get(catchAsync(campgrounds.index))//contorollerでルーターの中身を書いている
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));//新規登録送信
        //ここにもisLoggedInを置くことでPostmanからのリクエストも守る
        //upload.singleで一つの画像、upload.arrayで複数の画像(req.filesにはいる)(validateの前に置かないとvalidateでファイルがなくなってエラーになるので注意)
        //text情報は変わらずreq.body

//新規登録画面
//上から順に実行される。idの下に置いておくと、idがnewと勘違いされちゃう
//isLoggedInミドルウェアを入れることでログイン状態を確かめることができる
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))//詳細
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));



//編集画面
router.get('/:id/edit', isLoggedIn, isAuthor,  catchAsync(campgrounds.renderEditForm));

module.exports = router;