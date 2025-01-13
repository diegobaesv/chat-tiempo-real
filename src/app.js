require('dotenv').config();
const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = socket(httpServer);

const apiKeyIa = process.env.API_KEY_IA
console.log('apiKeyIa',apiKeyIa)

app.use(express.static('public'));

io.on('connection', async (socket)=>{
    const { id, handshake } = socket;
    console.log(`Se ha conectado [${id}] [${handshake.address}] - ${handshake.time}`);

    //RECIBO EVENTO LOGIN ENVIADO DESDE EL USUARIO X
    socket.on('evt_usuarioLogin',async (usuario)=>{
        cconsole.log('Se ha logueado el usuario', usuario);
        io.emit('evt_usuarioLogin', {
            ...usuario,
            fechaHora: handshake.time,
            idSocketRemitente: id,
            photo: usuario.photo || 'assets/images/default_profile.jpg' 
        });
    });

    //RECIBO EVENTO MENSAJE DESDE EL USUARIO X
    socket.on('evt_usuarioMensaje', async(mensaje)=>{
        console.log('Se ha recibido el mensaje', mensaje);
        io.emit('evt_usuarioMensaje', {
            ...mensaje,
            fechaHora: new Date(),
            idSocketRemitente: id,
            isIa: false  
        });
        
        
        if(mensaje.message.startsWith('@sisegpt')) {
            const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407";
            const body = {
                inputs: mensaje.message.replace('@sisegpt', ''),
                options: { wait_for_model: true }
            };
            
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        'Authorization': 'Bearer ' + apiKeyIa,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const json = await response.json();
                console.log('Respuesta IA', json);
                if(json && json.length > 0) {
                    io.emit('evt_usuarioMensaje', {
                        message: json[0].generated_text,
                        nickname: 'Sise GPT',  
                        fechaHora: new Date(),
                        idSocketRemitente: 'ABC-1234-DEF-IA-SISEGPT',  
                        isIa: true  
                    });
                }
            } catch (error) {
                console.error(error.message);
            
            }
        }
    });
    socket.on('evt_usuarioEstado', async (estado) => {
        console.log('Cambio de estado recibido:', estado);
        io.emit('evt_usuarioEstado', {
            idSocketRemitente: id,
            estado: estado.estado, 
            nickname: estado.nickname 
        
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
    socket.on('evt_pinMessage', (content) => {
        io.emit('evt_pinMessage', content); 
    });
    socket.on('evt_unpinMessage', () => {
        io.emit('evt_unpinMessage'); 
    });
    

});


module.exports = httpServer; 
