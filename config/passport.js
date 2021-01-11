var mysql = require('mysql');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var client = mysql.createConnection({
    user: 'root',   password: '1234',  database: 'bulletin_board'
});

passport.serializeUser(function(user, done){
    console.log('serializeUser: ' + JSON.stringify(user))

    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    client.query('SELECT * FROM users WHERE id = ?', [id], 
        function(err, result){
            if(err){
                console.log(err);
            }
            console.log('deserializeUser: ' , result);

            done(err, result[0]);
    });
});

passport.use('local-login',
    new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
        passReqToCallback: true
    }, function(request, username, password, done){
        client.query('SELECT * FROM users WHERE id = ?', [
            username
        ], function(err, result){
                console.log('passport: ' + JSON.stringify(result[0]));

                if (err){
                    console.log(err);
                    return done(err);
                }
                if (result[0] && bcrypt.compareSync(password, result[0].password)){
                    return done(null, result[0]);
                }else{
                    request.flash('username', username);
                    request.flash('errors', {login: '사용자 이름 또는 암호가 잘못되었습니다.'})
                    return done(null, false);
                }
        });
    })
);

module.exports = passport;
