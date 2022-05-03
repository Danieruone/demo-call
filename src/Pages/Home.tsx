import { useState } from 'react';

// router
import { useNavigate } from 'react-router-dom';

// UI
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

// npm
import { v4 as uuidv4 } from 'uuid';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  borderRadius: 5,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  p: 4,
};

export const Home = () => {
  let navigate = useNavigate();

  const [usernameModal, setUsernameModal] = useState(false);
  const [username, setUsername] = useState('');

  const saveUsername = () => {
    if (username !== '') {
      localStorage.setItem('user_name', username);
      generateUUID();
    }
  };

  const generateUUID = () => {
    const uuid = uuidv4();
    if (!localStorage.getItem('user_name')) {
      setUsernameModal(true);
    } else {
      navigate(`/${uuid}`);
    }
  };

  return (
    <>
      <div className='homeContainer'>
        <Button variant='outlined' onClick={generateUUID}>
          Create meeting room
        </Button>
      </div>

      <Modal
        open={usernameModal}
        onClose={() => setUsernameModal(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography
            style={{ marginBottom: 20 }}
            id='modal-modal-title'
            variant='h6'
            component='h2'
          >
            Choose your username!
          </Typography>

          <TextField
            style={{ marginBottom: 20 }}
            id='outlined-basic'
            label='Username'
            variant='outlined'
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />

          <Button variant='outlined' onClick={saveUsername}>
            Send
          </Button>
        </Box>
      </Modal>
    </>
  );
};