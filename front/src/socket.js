import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

// for dev
/* socket.onAny((event, ...args) => {
    console.log(event, args);
}) */;

export default socket;