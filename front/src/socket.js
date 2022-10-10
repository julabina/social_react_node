import io from 'socket.io-client';

const socket = io('localhost:3000');

socket.onAny((event, ...args) => {
    console.log(event, args);
});

/* socket.on("users", (users) => {
    users.forEach((user) => {
      user.self = user.userID === socket.id;
    });
    // put the current user first, and then sort by username
    this.users = users.sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
}); */

/* socket.on("user connected", (user) => {
    this.users.push(user);
}); */

export default socket;