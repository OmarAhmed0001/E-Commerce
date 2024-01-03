import http from 'http';

import { Server, Socket } from 'socket.io';

export const initSocket = (server: http.Server): Server => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket'],
  });

  io.on('connection', (socket: Socket) => {
    socket.on('joinRoom', (room: string) => {
      socket.join(room);
    });

    socket.on('leaveRoom', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      socket.removeAllListeners();
    });
  });

  return io;
};
