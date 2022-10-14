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

let users = [];

io.on('connection', socket => {
    console.log(socket.id + " user just connected");
    
    socket.on('CLIENT_MSG', ({ content, to }) => {
        socket.to(to).emit('SERVER_MSG', {
            content,
            from: socket.id
        })
    }) 

    socket.on('newUser', data => {
        users.push(data);

        if(data.socketID === undefined) {
            data.socketID = socket.id;
        }

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
}); 

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    console.log('listening on ' + bind);
});

server.listen(port);