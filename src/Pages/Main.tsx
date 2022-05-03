import { useEffect, useState } from 'react';

// components
import { UserIcon } from '../Components/UserIcon';
import { ControlsPanel } from '../Components/ControlsPanel';

// UI
import { CircularProgress } from '@mui/material';

// router
import { useNavigate, useParams } from 'react-router-dom';

// hooks
import { useSocketHandler } from '../hooks/useSocketHandler';

// types
import { User } from '../Interfaces/User';

export const Main = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { socket } = useSocketHandler();

  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    } else {
      socket.emit('join', {
        room: uuid,
        peer: 'test1',
        name: localStorage.getItem('user_name'),
      });

      socket.on('users', (data) => setUsersInRoom(data.users));
      socket.on('userConnected', (data) =>
        setUsersInRoom((prev) => [...prev, data])
      );
    }

    return () => {
      socket.emit('leave', uuid);
    };
  }, []);

  return (
    <div className='container'>
      {usersInRoom.length === 0 ? (
        <CircularProgress />
      ) : (
        usersInRoom.map((user, idx) => <UserIcon key={idx} {...user} />)
      )}
      <ControlsPanel />
    </div>
  );
};
