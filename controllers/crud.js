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
    const id = req.body.id_product;
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const stock = req.body.stock;
    pool.query(`UPDATE product SET 
    nombre = $1, 
    precio = $2,
    stock = $2  
    WHERE id_product = $3`, [{ nombre: nombre, precio: precio, stock: stock }], id, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/dashboard');
        }
    });
}

/*async actualizar(id, nombre, precio) {
    const resultados = conexion.query(`update productos
    set nombre = $1,
    precio = $2
    where id = $3`, [nombre, precio, id]);
    return resultados;
}*/





