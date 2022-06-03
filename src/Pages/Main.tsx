import { FC } from 'react';

// components
import { UserIcon } from '../components/UserIcon';
import { ControlsPanel } from '../components/ControlsPanel';

// UI
import { CircularProgress } from '@mui/material';

// hooks
import { useConnection } from '../hooks/useConnection';

// types
import { Socket } from 'socket.io-client';

interface Props {
  socket: Socket;
}

export const Main: FC<Props> = ({ socket }) => {
  const { usersInRoom, streams } = useConnection(socket);
  return (
    <div className='container'>
      {usersInRoom.length === 0 ? (
        <CircularProgress />
      ) : (
        usersInRoom.map((user, idx) => (
          <UserIcon key={idx} {...user} streams={streams} />
        ))
      )}
      <ControlsPanel />
    </div>
  );
};
