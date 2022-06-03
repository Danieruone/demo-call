import { FC, useEffect, useRef, useState } from 'react';

// types
import { User } from '../Interfaces/User';
import { Stream } from '../Interfaces/Stream';

export const UserIcon: FC<User & { streams: Stream[] }> = ({
  name,
  streams,
}) => {
  const [stream, setStream] = useState<Stream | null>(null);

  // eslint-disable-next-line
  const videoTag = useRef<any>();

  useEffect(() => {
    const streamToRender = streams.find((media) => media.name === name);
    if (streamToRender) {
      setStream(streamToRender);
    }
    return () => setStream(null);
  }, [streams, name]);

  useEffect(() => {
    if (stream) {
      videoTag.current.srcObject = stream.remoteStream;
      videoTag.current?.addEventListener('loadedmetadata', () => {
        videoTag.current?.play();
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
