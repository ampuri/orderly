import { HashRouter, Routes, Route } from 'react-router-dom';

import { AdminPage } from './pages/AdminPage';
import { GamePage } from './pages/GamePage';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  );
}
