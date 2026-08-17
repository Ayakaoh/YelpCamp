//campのseedsを作るため
//expressに関係なく動作するのでmongooseを起動させる必要がある
const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');//二つデータがあるので
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });
    
const sample = array => array[Math.floor(Math.random() * array.length)];//randomな組み合わせを作るsample関数
//配列を与えるとその中からランダムな値を取ってくる

const seedDB = async () => {
    await Campground.deleteMany({});//まず全データを消す
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);//0~cities.length-1のランダムな値
        const price = Math.floor(Math.random() * 2000) + 1000;
        const camp = new Campground({
            author: '6a7c17ef154bd2ba373a6786',
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,//〇〇県〇〇市
            title: `${sample(descriptors)}・${sample(places)}`,
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[randomCityIndex].longitude,
                    cities[randomCityIndex].latitude
                ]
            },
            price,
            images: [
                {
                url: 'https://res.cloudinary.com/zkpqhtfv/image/upload/v1786671624/YelpCamp/dhxdugsoctdvutijay1l.jpg',
                filename: 'YelpCamp/dhxdugsoctdvutijay1l'
                },
                {
                url: 'https://res.cloudinary.com/zkpqhtfv/image/upload/v1786671625/YelpCamp/b7ghlcep4pr4iowwz0ct.jpg',
                filename: 'YelpCamp/b7ghlcep4pr4iowwz0ct'
                },
                {
                url: 'https://res.cloudinary.com/zkpqhtfv/image/upload/v1786671625/YelpCamp/clnvs6h8rjftei38wjlf.jpg',
                filename: 'YelpCamp/clnvs6h8rjftei38wjlf'
                }
            ]         
        });
        await camp.save();
    }
}

seedDB().then(() => {//mongooseをクローズするようにするseedDBが終わった後に閉じるようになる
    //ターミナルが次のリクエストを受け付けてくれるようになる
    mongoose.connection.close();
});