import { FC, useEffect, useRef, useState } from 'react';
import { User } from '../Interfaces/User';

export const UserIcon: FC<User & { streams: any; personalStream: any }> = ({
  name,
  streams,
  personalStream,
}) => {
  const [stream, setStream] = useState<any>();

  const videoTag = useRef<any>();

  useEffect(() => {
    console.log(streams);
    const streamToRender = streams.find((media: any) => media.name === name);
    if (streamToRender) {
      setStream(streamToRender);
    }
    return () => setStream(null);
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
