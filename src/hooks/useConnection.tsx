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
  }, [navigate]);

  // get peer id
  useEffect(() => {
    peer.on('open', function (id: string) {
      setPeerId(id);
    });
  }, [peer]);

  //connection peer input
  useEffect(() => {
    peer.on('connection', function (conn: any) {
      conn.on('data', function (data: any) {
        const emittedData = JSON.parse(data);
        setStreams((prev) =>
          prev.map((stream) => {
            if (stream.remoteStream?.id === emittedData.remoteStreamId) {
              return { ...stream, ...emittedData };
            } else {
              return stream;
            }
          })
        );
      });
    });
  }, [peer]);

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
  }, [socket, peerId, uuid]);

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

      // peer call
      socket.on('userConnected', (data: User) => {
        setUsersInRoom((prev) => [...prev, data]);

        const streamsToAdd: Stream[] = [];

        const conn = peer.connect(data.peer);
        conn.on('open', function () {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              const call = peer.call(data.peer, stream);
              call.on('stream', function (remoteStream: MediaStream) {
                if (
                  !streamsToAdd.some(
                    (stream) => stream.remoteStream?.id === remoteStream.id
                  )
                ) {
                  streamsToAdd.push({
                    remoteStream,
                    name: data.name,
                  });
                  conn.send(
                    JSON.stringify({
                      name: localStorage.getItem('user_name'),
                      remoteStreamId: stream.id,
                    })
                  );
                  setStreams((prev) => [...prev, ...streamsToAdd]);
                }
              });
            });
        });
      });

      socket.on('leave', (data: string) => {
        const user = usersInRoom.find((user) => user.id === data);
        setUsersInRoom((prev) => prev.filter((user) => user.id !== data));
        setStreams(streams.filter((stream) => stream.name !== user?.name));
      });
    }
    //eslint-disable-next-line
  }, [socket]);

  // peer answer call
  useEffect(() => {
    const streamsToAdd: Stream[] = [];
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        peer.on('call', function (call: any) {
          call.answer(stream);
          call.on('stream', function (remoteStream: MediaStream) {
            if (
              !streamsToAdd.some(
                (stream) => stream.remoteStream?.id === remoteStream.id
              )
            ) {
              streamsToAdd.push({
                remoteStream,
              });
              setStreams((prev) => [...prev, ...streamsToAdd]);
            }
          });
        });
      });
  }, [peer]);

  return { usersInRoom, streams };
};
