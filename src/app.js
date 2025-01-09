const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = socket(httpServer);

app.use(express.static('public'));

io.on('connection', async (socket)=>{
    const { id, handshake } = socket;
    console.log(`Se ha conectado [${id}] [${handshake.address}] - ${handshake.time}`);

    //RECIBO EVENTO LOGIN ENVIADO DESDE EL USUARIO X
    socket.on('evt_usuarioLogin',async (usuario)=>{
        console.log('Se ha logueado el usuario', usuario);
        //AVISO A LOS DEMAS USUARIOS QUE EL USUARIO X SE HA CONECTADO
        io.emit('evt_usuarioLogin',{
            ...usuario, 
            fechaHora: handshake.time
        });
    });

    //RECIBO EVENTO MENSAJE DESDE EL USUARIO X
    socket.on('evt_usuarioMensaje', async(mensaje)=>{
        console.log('Se ha recibido el mensaje', mensaje);
        io.emit('evt_usuarioMensaje', {
            ...mensaje,
            fechaHora: new Date(),
            idSocketRemitente: id
        });
    });
});

module.exports = httpServer; 
