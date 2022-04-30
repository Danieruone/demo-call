import { useState } from 'react';

// icons
import { BsMicFill } from 'react-icons/bs';
import { BsMicMuteFill } from 'react-icons/bs';
import { BsFillCameraVideoFill } from 'react-icons/bs';
import { BsFillCameraVideoOffFill } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';

export const ControlsPanel = () => {
  const [micState, setMicState] = useState(false);
  const [cameraState, setCameraState] = useState(false);

  return (
    <div className='controlsPanelContainer'>
      <div
        className='controlPanelOption'
        onClick={() => setMicState(!micState)}
      >
        {micState ? <BsMicFill /> : <BsMicMuteFill />}
      </div>

      <div
        className='controlPanelOption'
        onClick={() => setCameraState(!cameraState)}
      >
        {cameraState ? <BsFillCameraVideoFill /> : <BsFillCameraVideoOffFill />}
      </div>

      <div className='controlPanelOption'>
        <BsThreeDotsVertical />
      </div>

      <div className='controlPanelOption endCall'>
        <IoCall />
      </div>
    </div>
  );
};
