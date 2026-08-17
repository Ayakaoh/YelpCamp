const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);//app.jsで定義したパラメータ（:id)はそのままではルータの方に渡ってこない　なので上でrouter定義する時にオプションつける
    const review = new Review(req.body.review);//データはreviewの中のratingとかbodyで設定しているのでとりあえずreviewを取り出す
    review.author = req.user._id;//reviewのauthorを設定
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'レビューを登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//中に入っている対象のレビューだけを消去する
    //$pullは特定の条件を満たした要素をremoveする
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました');
    res.redirect(`/campgrounds/${id}`);
}