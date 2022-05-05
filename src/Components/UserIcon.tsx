import { FC, useEffect, useRef, useState } from 'react';
import { User } from '../Interfaces/User';

export const UserIcon: FC<User & { streams: any }> = ({ name, streams }) => {
  const [stream, setStream] = useState<any>();

  const videoTag = useRef<any>();

  useEffect(() => {
    setStream(streams.find((media: any) => media.name === name));
  }, [streams]);

  useEffect(() => {
    if (stream) {
      videoTag.current.srcObject = stream.remoteStream;
      videoTag.current.addEventListener('loadedmetadata', () => {
        videoTag.current.play();
      });
    }
  }, [stream]);

  return (
    <div className='userContainer'>
      {stream ? (
        <>
          <video ref={videoTag} />
          <span>{name}</span>
        </>
      ) : (
        <>
          <div>
            <h1>{name.charAt(0).toUpperCase()}</h1>
          </div>
          <p style={{ marginTop: 10 }}>{name}</p>
        </>
      )}
    </div>
  );
};
