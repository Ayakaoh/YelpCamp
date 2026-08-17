//1つのcampground
const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;



const imageSchema = new Schema({
    url: String,
    filename: String,
});//別で定義することで、virtualを設定できるようになる

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
    //あたかもthumbnailというプロパティがあるかのように見える
});

const opts = { toJSON: { virtuals: true } };//デフォルトではMongooseはvirtuslはJSONに含めないので、propertiesがなくなってしまう。stringifyした後もpropertiesを使うにはこれを書く

const campgroundSchema = new Schema({
    title: String,
    price: String,
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'//userモデルのIDとの関連付け
    },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);//optsでオプションを渡す

//propertiesのなかのpopupMarkupというネストした形にする
campgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

//docには削除されたcampgroundsが入るはず
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews//_idがこの配列の中の値に含まれていたらそれを削除する
                //そのcampgroundsの中に入っていたreviewsたちのidを消去
            }
        })
    }
});


module.exports = mongoose.model('Campground', campgroundSchema);
