// router
import { Routes, Route } from 'react-router-dom';

// pages
import { Main } from './Pages/Main';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Main />} />
    </Routes>
  );
}

export default App;
