import { FC } from 'react';

// components
import { UserIcon } from '../Components/UserIcon';
import { ControlsPanel } from '../Components/ControlsPanel';

// UI
import { CircularProgress } from '@mui/material';

// hooks
import { useConnection } from '../hooks/useConnection';

interface Props {
  // eslint-disable-next-line
  socket: any;
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
