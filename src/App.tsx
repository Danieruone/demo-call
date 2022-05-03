// router
import { Routes, Route } from 'react-router-dom';

// pages
import { Home } from './Pages/Home';
import { Main } from './Pages/Main';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/:uuid' element={<Main />} />
    </Routes>
  );
}

export default App;
