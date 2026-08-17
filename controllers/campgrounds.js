const Campground = require('../models/campground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');//geocodingを使用
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });//リクエストを投げるクライアント

const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    .populate({//ただreviesを渡すのではなくobjectを渡すことで各々のauthorを取り出したい
        path: 'reviews',//populateするものを書くことができる
        populate: {//さらにその中のpopulateするものを書くことができる
            path: 'author'
        }
    }).populate('author');//reviewも一緒に撮れているはず
    if (!campground) {//消されたとかでcampgroundがない場合
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    
}

module.exports.createCampground = async (req, res)=>{
    //まずvalidateCampgroundを実行
    const geoData = await geocoder.forwardGeocode({//queryとlimitを指定する（場所とクエリ数の制限）
        query: req.body.campground.location,
        limit: 1
    }).send();
    //bodyに情報が入るようになる。GeoJSONという形式。地理情報をJSONで表現（featuresの中のgeomery)
    //type: "Point", coordinates:緯度経度の配列
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;//経度緯度を取得
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));//一個一個のオブジェクトからそれぞれの情報をとる
    campground.author = req.user._id;//そのログインしているユーザーのIDを付与する
    await campground.save();
    console.log(campground);
    req.flash('success', '新しいキャンプ場を登録しました')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async (req, res)=>{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}


module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    //スプレッド構文。campgroundの中の値(titleとか)が展開されてそれぞれ代入される
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));//一個一個のオブジェクトからそれぞれの情報をとる
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);//filenameを渡して消去
        }//cloudinary側も消去する（cloudinaryは　cloudinary/indexで設定してる）
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        //pullで消去するものを指定。それはimages:があるfilenaeのもの。そのfilenameはdeleteImagesで指定された配列に含まれているものが消去される
    }
    req.flash('success', 'キャンプ場を更新しました');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect('/campgrounds');
}