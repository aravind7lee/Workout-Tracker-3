import React from 'react';
import { createRoot } from 'react-dom/client';
import TestReact from './test-react.jsx';

// Minimal React setup for testing
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<TestReact />);
}