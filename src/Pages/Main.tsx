import { useEffect, useState, useRef, FC } from 'react';
import Peer from 'peerjs';

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

  const videoTag = useRef<any>({});

  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  // peer
  const [peer, setPeer] = useState<any>(new Peer());
  const [peerId, setPeerId] = useState();

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    }

    peer.on('connection', function (conn: any) {
      conn.on('data', function (data: any) {
        // Will print 'hi!'
        console.log(data);
      });
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        peer.on(
          'call',
          function (call: any) {
            call.answer(stream);
            call.on('stream', function (remoteStream: any) {
              videoTag.current.srcObject = remoteStream;
              videoTag.current.addEventListener('loadedmetadata', () => {
                videoTag.current.play();
              });
            });
          },
          function (err: any) {
            console.log('Failed to get local stream', err);
          }
        );
      });

    peer.on('open', function (id: any) {
      setPeerId(id);
    });
  }, []);

  useEffect(() => {
    if (socket && peerId) {
      socket.emit('join', {
        room: uuid,
        peer: peerId,
        name: localStorage.getItem('user_name'),
      });

      socket.on('users', (data: any) => setUsersInRoom(data.users));

      socket.on('userConnected', (data: User) => {
        setUsersInRoom((prev) => [...prev, data]);

        let conn = peer.connect(data.peer);

        conn.on('open', function () {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const call = peer.call(data.peer, stream);
              call.on('stream', function (remoteStream: any) {
                videoTag.current.srcObject = remoteStream;
                videoTag.current.addEventListener('loadedmetadata', () => {
                  videoTag.current.play();
                });
              });
            });
        });
      });

      socket.on('leave', (data: any) =>
        setUsersInRoom((prev) => prev.filter((user) => user.id !== data))
      );
    }

    return () => socket && socket.emit('leave', uuid);
  }, [socket, peerId]);

  return (
    <div className='container'>
      <div>
        <video ref={videoTag} />
        <video ref={videoTag} />
      </div>
      {usersInRoom.length === 0 ? (
        <CircularProgress />
      ) : (
        usersInRoom.map((user, idx) => <UserIcon key={idx} {...user} />)
      )}
      <ControlsPanel />
    </div>
  );
};
