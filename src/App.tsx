import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AdminPage } from './pages/AdminPage';
import { GamePage } from './pages/GamePage';

export function App() {
  return (
    <BrowserRouter basename="/orderly">
      <Routes>
        <Route path="/" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
