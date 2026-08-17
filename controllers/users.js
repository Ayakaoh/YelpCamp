const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });//usernameとemailのみ渡す。この時まだパスワードは渡さない
        const registeredUser = await User.register(user, password);//ここでパスワードを渡す
        req.login(registeredUser, err => {
            //登録と同時にログインもしてくれるようになる
            //awati処理がないのでcallbackで
            if (err) return next(err);//エラーがあったらネクストを呼ぶ
            req.flash('success', 'Yelp Campへようこそ！');//上に出るやつ
            res.redirect('/campgrounds');
        })

    } catch (e) {
        req.flash('error', e.message);//userの方でエラーメッセージを登録しておく
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'おかえりなさい！！');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    // req.logout にコールバック関数を渡します
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });
}