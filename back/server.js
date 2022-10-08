const http = require('http');
const app = require('./app');

const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if(port >= 0) {
        return port;
    }
    return false;
};

const port = normalizePort(process.env.PORT || '3000');

app.set('port', port);

const errorHandler = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES': 
            console.error(bind + ' require elevated privileges.');
            process.exit(1);
            break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use.');
                process.exit(1);
                break;
            default:
                throw error;
    };
};

const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
      }
});

/* io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
}); */
let users = [];

io.on('connection', socket => {
    console.log(socket.id + " user just connected");
    console.log("----------------------------------------------");
    console.log(socket.id);

    

   
 /*
    for (let [id, socket] of io.of("/").sockets) {
        users.push({
            userID: id,
            username: socket.username,
        });

        socket.emit("users", users);
    }
    

    socket.broadcast.emit("user connected", {
        userID: socket.id,
        username: socket.username,
      });*/

    /* socket.on('CLIENT_MSG', data => {
        io.emit('SERVER_MSG', data);
    })  */

    socket.on('CLIENT_MSG', ({ content, to }) => {
        socket.to(to).emit('SERVER_MSG', {
            content,
            from: socket.id
        })
        console.log(content);
    }) 

    socket.on('newUser', data => {
        users.push(data);
        console.log(data);
        console.log(data.socketID);
        if(data.socketID === undefined) {
            data.socketID = socket.id;
        }
        console.log(data);

        io.emit('server_newUser_response', users);
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected');

        users = users.filter(el => {
            return el.socketID !== socket.id;
        });

        io.emit('server_newUser_response', users);
        socket.disconnect();
    });
    console.log("+++++++++++++++++++++++++++++++++++++++++++++");
}); 

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    console.log('listening on ' + bind);
});

server.listen(port);