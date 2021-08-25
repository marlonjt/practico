const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('./database/dbConfig');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const crud = require('./controllers/crud');


const initializePassport = require('./controllers/passportConfig');
initializePassport(passport);

router.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

router.use(passport.initialize());
router.use(passport.session());

router.use(flash());
// rutas de la vistas
router.get('/', (req, res) => {
    res.render('index');
});

// vista del login
router.get('/login', checkAuthenticated, (req, res) => {
    res.render('index');
});

// vista de la tienda
router.get('/dashboard',checkNotAuthenticated, (req, res) => {
    pool.query(`SELECT * FROM product`, (error, datos) => {
        if (error) {
            throw error;
        } else {
            res.render('dashboard', { datos: datos.rows });
        }
    });
})

// vista de los pedidos
router.get('/pedidos', (req, res) => {
    pool.query(`select id_detalle_factura as id, users.name as nombre, product.nombre as producto, invoice.fecha  as date from detalle 
    inner join product on detalle.producto_id = product.id_product 
    inner join invoice on detalle.factura_id = invoice.id_factura 
    inner join users on invoice.user_id = users.id`, (error, datos) => {
        if (error) {
            throw error;
        } else {
            res.render('pedidos', { datos: datos.rows });
        }
    });
})

//vista del registro
router.get('/register', (req, res) => {
    res.render('register');
});
//salida del login
router.get("//logout", (req, res) => {
    req.logout();
    res.render("login", { message: "Saliste con exito" });
});

// metodo de crear
router.get('/create', (req, res) => {
    res.render('create');
})

//metodo post para registro del usuario
router.post("/register", async (req, res) => {
    let { name, email, password, password2 } = req.body;
    let errors = [];
    console.log({
        name,
        email,
        password,
        password2
    });

    if (!name || !email || !password || !password2) {
        errors.push({ message: "Llene los campos" });
    }

    if (password.length < 6) {
        errors.push({ message: "Clave menor a 6 caracteres" });
    }

    if (password !== password2) {
        errors.push({ message: "Contraseñas no coinciden" });
    }

    if (errors.length > 0) {
        res.render('/register', { errors, name, email, password, password2 });
    } else {
        hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // Validation para ver si el usuario ya esta registrado y pasar al login
        pool.query(
            `SELECT * FROM users
          WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    console.log(err);
                }
                console.log(results.rows);
                if (results.rows.length > 0) {
                    //console.log("registrado");
                    return res.render('register', {
                        message: "Email registrado"
                    });
                } else {
                    //enviamos el usuario a registrar
                    pool.query(
                        `INSERT INTO users (name, email, password)
                  VALUES ($1, $2, $3)
                  RETURNING id, password`,
                        [name, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Registro Exitoso, logueate");
                            res.redirect("/");
                        }
                    );
                }
            }
        );
    }
});

// metodo  para logueo
router.post(
    '/',
    passport.authenticate('local', {
        successRedirect: 'dashboard',
        failureRedirect: '/',
        failureFlash: true
    })
);

//metodo editar
router.get('/edit/:id_product', (req, res) => {
    const id = req.params.id_product;
    pool.query(`SELECT * FROM product WHERE id_product = $1`, [id],
        (error, results) => {
            if (error) {
                console.log(error);
            } else {
                res.render('edit', { datos: results.rows[0] });
                //console.log('este es id_product:'+ results.rows[0])
            }
        })
});

//metodo delete
router.get('/delete/:id_product', (req, res) => {
    const id = req.params.id_product;
    pool.query(`DELETE FROM product WHERE id_product = $1`, [id],
        (error, datos) => {
            if (error) {
                console.log(error);
            } else {
                res.redirect('/dashboard');
            }
        })
});

//Funciones para validar la sesion dentro de la web
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

// rutas de crud
router.post('/save', crud.save);
router.post('/update', crud.update);

module.exports = router;
