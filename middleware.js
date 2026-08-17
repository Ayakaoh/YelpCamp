const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');


//ログイン済みかどうかを確かめる
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {//ログイン済みかどうかを確かめる
        req.session.returnTo = req.originalUrl;//元々いたURLを記憶
        req.flash('error', 'ログインしてください');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

//------campgrounds------
//バリデーション
//特定のルーティングにだけミドルウェアを適用したい時は、引数にいくらでもコールバックを増やせるので、postとかputのところに追加しておく
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}
//ユーザーとcampgroundsの紐付け
//campgroundsの編集権限（ログインしている人＝author)を確かめる
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {//ログインしている人とauthorが一緒かどうか
        req.flash('error', 'そのアクションの権限がありません');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();//もし権限があれば後続の処理へ
}



//ーーーーーーreviewsーーーーーーー
//バリデーション
//特定のルーティングにだけミドルウェアを適用したい時は、引数にいくらでもコールバックを増やせるので、postとかputのところに追加しておく
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//ユーザーとauthorの紐付け
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;//idがcampgroundのid, reviewIdがreviewのID（クエリパラメータより）
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'そのアクションの権限がありません');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}