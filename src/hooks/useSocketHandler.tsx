import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocketHandler = () => {
  const SOCKET_URL = 'wss://meet-app-dev.herokuapp.com/meet';

  const [socket, setsocket] = useState<Socket>();

  useEffect(() => {
    setsocket(
      io(SOCKET_URL, {
        transports: ['websocket'],
      })
    );
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => console.log('client connected'));
    }
  }, [socket]);

  return { socket };
};
