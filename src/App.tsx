// router
import { Routes, Route } from 'react-router-dom';

// pages
import { Home } from './pages/Home';
import { Main } from './pages/Main';

// hooks
import { useSocketHandler } from './hooks/useSocketHandler';

function App() {
  const { socket } = useSocketHandler();

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/:uuid' element={<Main socket={socket} />} />
    </Routes>
  );
}

export default App;
