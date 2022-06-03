import { useEffect, useMemo, useState } from 'react';

// peer
import Peer from 'peerjs';

// router
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

// types
import { User } from '../Interfaces/User';
import { Stream } from '../Interfaces/Stream';

export const useConnection = (socket: any) => {
  const navigate = useNavigate();
  const { uuid } = useParams();

  const [streams, setStreams] = useState<Stream[]>([]);
  const [usersInRoom, setUsersInRoom] = useState<User[]>([]);

  // peer
  const peer = useMemo(() => new Peer(), []);
  const [peerId, setPeerId] = useState<string>();

  useEffect(() => {
    if (!localStorage.getItem('user_name')) {
      navigate('/');
    }
  }, []);

  // get peer id
  useEffect(() => {
    peer.on('open', function (id: string) {
      setPeerId(id);
    });
  }, []);

  //connection peer input
  useEffect(() => {
    peer.on('connection', function (conn: any) {
      conn.on('data', function (data: any) {
        const emittedData = JSON.parse(data);
        if (
          !streams.some(
            (stream) => stream.remoteStream?.id === emittedData.remoteStreamId
          )
        ) {
          setStreams((prev) =>
            prev.map((stream) => {
              if (stream.remoteStream?.id === emittedData.remoteStreamId) {
                return { ...stream, ...emittedData };
              } else {
                return stream;
              }
            })
          );
        }
      });
    });
  }, []);

  // manage users
  useEffect(() => {
    if (socket && peerId) {
      if (uuid === 'null') {
        socket.emit('createRoom');
      } else {
        socket.emit('join', {
          room: uuid,
          peer: peerId,
          name: localStorage.getItem('user_name'),
        });
      }
    }
    return () => socket && socket.emit('leave');
  }, [socket, peerId]);

  // manage answer in call
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        peer.on('call', function (call: any) {
          call.answer(stream);
          call.on('stream', function (remoteStream: MediaStream) {
            if (
              !streams.some(
                (stream) => stream.remoteStream?.id === remoteStream.id
              )
            ) {
              setStreams((prev) => [...prev, { remoteStream }]);
            }
          });
        });
      });
  }, []);

  // manage listeners
  useEffect(() => {
    if (socket) {
      socket.on('createRoom', (roomId: string) => {
        navigate(`/${roomId}`);
        socket.emit('join', {
          room: roomId,
          peer: peerId,
          name: localStorage.getItem('user_name'),
        });
      });

      socket.on('users', (data: any) => {
        setUsersInRoom(data.users);
      });

      socket.on('userConnected', (data: User) => {
        setUsersInRoom((prev) => [...prev, data]);

        const conn = peer.connect(data.peer);
        conn.on('open', function () {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const call = peer.call(data.peer, stream);
              call.on('stream', function (remoteStream: MediaStream) {
                console.log(remoteStream);
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
              });
            });
        });
      });

      socket.on('leave', (data: string) => {
        setUsersInRoom((prev) => prev.filter((user) => user.id !== data));
        setStreams([]);
      });
    }
    //eslint-disable-next-line
  }, [socket]);

  return { usersInRoom, streams };
};
