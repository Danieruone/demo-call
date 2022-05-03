import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const useSocketHandler = () => {
  const SOCKET_URL = 'wss://meet-app-dev.herokuapp.com/meet';

  const [online, setOnline] = useState(false);

  const socket = useMemo(() => {
    return io(SOCKET_URL, {
      transports: ['websocket'],
    });
  }, [SOCKET_URL]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('client connected');
      setOnline(true);
    });
  }, [socket]);

  useEffect(() => {
    socket.on('disconnect', () => {
      setOnline(false);
    });
  }, [socket]);

  return { socket, online };
};
