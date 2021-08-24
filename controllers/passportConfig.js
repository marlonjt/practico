const LocalStrategy = require('passport-local').Strategy;
const { pool } = require('../database/dbConfig');
const bcrypt = require('bcrypt');

function initialize(passport) {
    console.log('Initialized');
    const authenticateUser = (email, password, done) => {
        console.log(email, password);
        pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows)
                if (results.rows.length > 0) {
                    const user = results.rows[0];
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Contraseña incorrecta" });
                        }
                    });
                }
                else {
                    return done(null, false, {
                        message: "Ningun usuario con ese correo"
                    });
                }
            }
        );
    };

    passport.use(
        new LocalStrategy(
            { usernameField: "email", passwordField: "password" },
            authenticateUser
        )
    );
    
    // almancea los datos del usuario y ve la estado de la sesion
    passport.serializeUser((user, done) => done(null, user.id));

    //Ve los datos de la BD almacenada para la obtencion de la sesion
    passport.deserializeUser((id, done) => {
        pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
            if (err) {
                return done(err);
            }
            console.log(`ID is ${results.rows[0].id}`);
            return done(null, results.rows[0]);
        });
    });
}

module.exports = initialize;