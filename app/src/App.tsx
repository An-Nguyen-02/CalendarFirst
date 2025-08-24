import { Suspense, lazy } from "react";
import './App.css';
import NavigationBar from './components/NavigationBar/NavigationBar.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import { Routes, Route } from 'react-router-dom';

const Calendar = lazy(() => import('./components/Calendar/Calendar.tsx'));
const Login = lazy(() => import('./components/Login/Login.tsx'));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <h1>Calendar Third</h1>
      <NavigationBar />
      <Routes>
          <Route
            path="/"
            element={<ProtectedRoute />}
          >
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Suspense>
  )
}

export default App
