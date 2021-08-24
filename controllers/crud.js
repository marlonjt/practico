const { pool } = require('../database/dbConfig');
exports.save = (req, res) => {
    let { nombre, precio, stock } = req.body;
    pool.query(`INSERT INTO product (nombre, precio, stock)
    VALUES ($1, $2, $3)`,
        [nombre, precio, stock],
        (error, data) => {
            if (error) {
                console.log(error);
            } else {
                res.redirect('/dashboard');
            }
        })
}

exports.update = (req, res) => {
    let { id_product, nombre, precio, stock } = req.body;
    pool.query(`UPDATE product SET 
        nombre = $1,
        precio = $2,
        stock = $2,
        WHERE id_product = $3`, [{nombre, precio, stock}, id_product]),
        (error, data) => {
            if (error) {
                console.log(error);
            } else {
                res.redirect('/dashboard');
            }
        };

}





