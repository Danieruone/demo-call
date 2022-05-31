import { useEffect, useMemo, useState } from 'react';
import Peer from 'peerjs';

// router
import { useNavigate, useParams } from 'react-router-dom';

// types
import { User } from '../interfaces/User';

export const useConnection = (socket: any) => {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [streams, setStreams] = useState<any[]>([]);
  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  // peer
  const peer = useMemo(() => new Peer(), []);

  const [peerId, setPeerId] = useState<string>();

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    }

    peer.on('open', function (id: string) {
      setPeerId(id);
    });
  }, [navigate, peer]);

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
  }, [streams, peer]);

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

        const conn = peer.connect(data.peer);

        conn.on('open', function () {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const call = peer.call(data.peer, stream);
              call.on('stream', function (remoteStream: any) {
                console.log('contestó remote:', remoteStream);
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
    // eslint-disable-next-line
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

  return { usersInRoom, streams };
};
