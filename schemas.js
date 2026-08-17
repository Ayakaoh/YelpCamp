//ブラウザ上におけるバリデーションチェック

const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//joiのstringに対して新たにescapeHTMLを使えるようにしている
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'//#labelには書いた場所が入る
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {//渡ってきた値に対してsanitizeHtmlをしている（HTMLを除外していくれるパッケージ）
                    //cleanにはサニタイズ済みの値が入る
                    allowedTags: [],//どういうタグを許可するかのオプション
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })//元の値と変わってたらエラー（string.escapeHTMLは文言）
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);//拡張が含まれたJoiが出来上がる

//スキーマの作成
//objectに(req.body)の中にcampgroundというキーがあることを期待する
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({//さらにcampgroundがobjectであることを期待したい
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),//campgroundについてるrequired
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});