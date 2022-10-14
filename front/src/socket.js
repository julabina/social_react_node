import io from 'socket.io-client';

const socket = io('localhost:3000');

// for dev
/* socket.onAny((event, ...args) => {
    console.log(event, args);
}) */;

export default socket;