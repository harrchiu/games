import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Circles from './circles';
import _24game from './24game';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path='/circles' element={<Circles />} />
        <Route path='/24game' element={<_24game />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
