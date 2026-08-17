const express = require('express');
const router = express.Router();
const passport = require('passport');
const{ storeReturnTo }=require('../middleware');
const users = require('../controllers/users')
//catchAsyncではなく、新たにtrycatchを書いて、メッセージを出すだけにとどめることにする

router.route('/register')
    .get(users.renderRegister)
    .post(users.register);

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);
    //認証のロジック
    //authenticateの第一引数がログインの方法（local)
    //第二引数がオプション（間違えた時にflash,redirect)
    //関数内に入る時には認証が終わっている（.loginはいらない）
    //ちなみにその後はrequestの中にisAuthenticatedが追加されて、それを呼び出すことでログイン済みかどうかを確認することができる（middleware.jsとか）
    //logoutメソッドもrequestオブジェクトの中にあるのでそれが使える
    //res.locals.returnToを使用する（動画と違うのはNotionに記載。）resdirectUrlをセッションクリア後も保管しておくため

//logout
// 引数に next を追加します
router.get('/logout', users.logout);

module.exports = router;