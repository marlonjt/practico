const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;


// vista de ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

//requiere las rutas 
app.use('/', require('./router'));

// puerto 
app.listen(PORT, () =>{
    console.log(`server on localhost:${PORT}`)
});