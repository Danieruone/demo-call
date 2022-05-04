import { useEffect, useState, FC } from 'react';

// components
import { UserIcon } from '../Components/UserIcon';
import { ControlsPanel } from '../Components/ControlsPanel';

// UI
import { CircularProgress } from '@mui/material';

// router
import { useNavigate, useParams } from 'react-router-dom';

// types
import { User } from '../Interfaces/User';

interface Props {
  socket: any;
}

export const Main: FC<Props> = ({ socket }) => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('join', {
        room: uuid,
        peer: 'test1',
        name: localStorage.getItem('user_name'),
      });

      socket.on('users', (data: any) => setUsersInRoom(data.users));

      socket.on('userConnected', (data: User) =>
        setUsersInRoom((prev) => [...prev, data])
      );

      socket.on('leave', (data: any) =>
        setUsersInRoom((prev) => prev.filter((user) => user.id !== data))
      );
    }

    return () => socket && socket.emit('leave', uuid);
  }, [socket]);

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
