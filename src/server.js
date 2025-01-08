const httpServer = require('./app');
const PORT = 3000;
httpServer.listen(PORT,()=>{
    console.log(`El servicio esta corriendo el puerto ${PORT}`)
});
