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
            fechaHora: handshake.time,
            idSocketRemitente: id
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

    //RECIBO LA UBICACION DEL USUARIO X
    socket.on('evt_usuarioLocation',async (ubicacion)=>{
        console.log('Se ha recibido la ubicacion', ubicacion);
        io.emit('evt_usuarioLocation', {
            ...ubicacion,
            fechaHora: new Date(),
            idSocketRemitente: id
        });
    });

    //RECIBO EL CAMBIO DE ESTADO DEL USUARIO X
    socket.on('evt_usuarioEstado', async (estado)=>{
        console.log('Se ha recibido un cambio de estado', estado);
        io.emit('evt_usuarioEstado',{
            ...estado,
            idSocketRemitente: id
        });
    });
});

module.exports = httpServer; 