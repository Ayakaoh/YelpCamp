// reviews/のルーター
const express = require('express');
const router = express.Router({ mergeParams: true });//親の方で定義されたパラメータをルータで使えるようにする（mergeParams)

const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//レビューだけ削除してしまうとcampgroundのなかのrevies配列は消去されないので、取得して、そっちも消去する必要がある
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;