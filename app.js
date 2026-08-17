
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
//環境変数。node.jsがどういう環境で動いているかを入れる。
// 本番用ならproduction
// Node.jsがもし本番用で動いてない時は、.envから環境変数の値を取ってくる（開発モードの時だけ）
// 本番の時はまた別の方法で環境変数を入れることになる。
//process.envを使って環境変数でその値を使う

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');

const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');

//モデル
const User = require('./models/user');
// const Campground = require('./models/campground');
// const Review = require('./models/review');
const helmet = require('helmet');//その他httpのセキュリティに関するミドルウェア

const mongoSanitize = require('express-mongo-sanitize');


//ルーター
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

const MongoStore = require('connect-mongo');
//MongoDBへの接続
// process.env.DB_URL
mongoose.connect(dbUrl,
    {   
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDBコネクションOK！！');
    })
    .catch(err => {
        console.log('MongoDBコネクションエラー！！！');
        console.log(err);
    });


const app = express();

app.engine('ejs', ejsMate);//デフォルトのエンジンではなくejsMateのエンジンを使う（requireもしておく）。レイアウトの機能が追加されている
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));//req.bodyの有効化
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
//publicディレクトリが提供されるようになるはず(ejsでそのディレクトリのjavascriptを入れることができる)
app.use(mongoSanitize({//＄とかを_に置き換えるミドルウェア（セキュリティのため）
    replaceWith: '_',
}));


const secret = process.env.SECRET || 'mysecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter:24*60*60,// 24時間ごとにセッションを更新(何もしてないなら毎回セーブはしない)
    crypto:{
        secret: secret
    }
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
});

//------色々使えるようにする------
const sessionConfig = {
    store,
    name: 'session',//デフォルトのセッションの名称を変わる
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {//
        httpOnly: true,//http経由でしか（セッションに関するクッキーは）アクセスできない(javascript側からアクセスできないようにする)
        // secure: true,//httpsでしかだめ
        maxAge: 1000 * 60 * 60 * 24 * 7//cookieの有効期限(ms)
    }
};

//sesssion
app.use(session(sessionConfig));
//passport
app.use(passport.initialize());
app.use(passport.session());//sessionのほうのuseを先に書いておく必要がある
passport.use(new LocalStrategy(User.authenticate()));//ログイン方法（LocalStrategy)、認証（authenticate（勝手に追加されているstaticメソッド）)方法の指定
passport.serializeUser(User.serializeUser());//セッションの中にユーザーの情報をどうやって詰め込むか
passport.deserializeUser(User.deserializeUser());//セッションに入っている情報からユーザーをどうやて作るか
//flash
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,//自分のアカウントの名前がURLに入るはずなのでそれだけ許可にする
    'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({//CSPに許可するコンテンツ先を増やす
    directives: {//URLを増やす
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));


//flashを利用する際にreq.flashとしなくてよくなるミドルウェア（ローカル変数の設定みたいな）
//ここで設定すれば、他のファイルからも使用することができる
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;//すべてのテンプレートからcurrentUserを使うことができるはず（req.userにはログイン時のユーザーの情報が入っている。誰がログインしているか）
    res.locals.success = req.flash('success');//どのテンプレートからでもsuccessを利用することができるようになる（１サイクル分だけ）
    res.locals.error = req.flash('error');//キャンプ場が見つからなかった場合のメッセージ用
    next();
});


//ルーター（ミドルウェアの下に書く）
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);



//ーーーーーールーティングーーーーーー
app.get('/', (req, res) => {
    res.render('home');
});


//全部のパスのどんなメソッドでも
app.all('*', (req, res, next) => {
    next(new ExpressError('ページが見つかりませんでした', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {//ページ見つかりませんでしたエラー(app.allで設定したエラー）ならすでに入っている
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err });
});

//Renderが自動で割り当てるポートを使う設定にする
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`ポート${port}でリクエスト待受中...`);
});