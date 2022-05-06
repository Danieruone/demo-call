import { useEffect, useState, FC } from 'react';
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

  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  // peer
  const peer = new Peer();
  const [peerId, setPeerId] = useState();
  const [streams, setStreams] = useState<any[]>([]);
  const [personalStream, setPersonalStream] = useState<any>();

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    }

    peer.on('open', function (id: any) {
      setPeerId(id);
    });
  }, []);

  useEffect(() => {
    peer.on('connection', function (conn: any) {
      conn.on('data', function (data: any) {
        const emittedData = JSON.parse(data);

        if (
          !streams.some(
            (stream) => stream.remoteStream.id === emittedData.remoteStreamId
          )
        ) {
          setStreams((prev) =>
            prev.map((stream) => {
              if (stream.remoteStream.id === emittedData.remoteStreamId) {
                return { ...stream, ...emittedData };
              } else {
                return stream;
              }
            })
          );
        }
      });
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        peer.on('call', function (call: any) {
          call.answer(stream);
          call.on('stream', function (remoteStream: any) {
            console.log('llegó remote:', remoteStream);
            setPersonalStream(stream);
            if (
              !streams.some(
                (stream) => stream.remoteStream.id === remoteStream.id
              )
            ) {
              setStreams((prev) => [...prev, { remoteStream }]);
            }
          });
        });
      });
  }, [streams]);

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
                console.log('contestó remote:', remoteStream);
                setPersonalStream(stream);
                if (
                  !streams.some(
                    (stream) => stream.remoteStream.id === remoteStream.id
                  )
                ) {
                  setStreams((prev) => [
                    ...prev,
                    { remoteStream, peer: data.peer, name: data.name },
                  ]);

                  conn.send(
                    JSON.stringify({
                      name: localStorage.getItem('user_name'),
                      peer: peerId,
                      remoteStreamId: stream.id,
                    })
                  );
                }
              });
            });
        });
      });
    }

    return () => socket && socket.emit('leave', uuid);
  }, [socket, peerId]);

  useEffect(() => {
    if (socket) {
      socket.on('leave', (data: string) => {
        const userLeaved = usersInRoom.find((user) => user.id !== data);
        setUsersInRoom((prev) => prev.filter((user) => user.id !== data));
        if (userLeaved) {
          setStreams((prev) =>
            prev.filter((user) => user.name !== userLeaved.name)
          );
        }
      });
    }
  }, [usersInRoom, socket]);

  return (
    <div className='container'>
      {usersInRoom.length === 0 ? (
        <CircularProgress />
      ) : (
        usersInRoom.map((user, idx) => (
          <UserIcon
            key={idx}
            {...user}
            streams={streams}
            personalStream={personalStream}
          />
        ))
      )}
      <ControlsPanel />
    </div>
  );
};
