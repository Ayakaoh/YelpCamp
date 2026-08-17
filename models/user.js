const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');
const passportPlugin = passportLocalMongoose.default || passportLocalMongoose;


//emailだけにする。passport-lical-mongooseが勝手に名前とかハッシュ、saltを決めてくれるため
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true//emailが一意になることを保証
    }
});

// pluginメソッドを使って、passportLicalMongooseを入れ込む
userSchema.plugin(passportPlugin, {
    errorMessages: {
        UserExistsError: 'そのユーザー名はすでに使われています。',
        MissingPasswordError: 'パスワードを入力してください。',
        AttemptTooSoonError: 'アカウントがロックされてます。時間をあけて再度試してください。',
        TooManyAttemptsError: 'ログインの失敗が続いたため、アカウントをロックしました。',
        NoSaltValueStoredError: '認証ができませんでした。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています。',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています。',
    }
});
// userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);