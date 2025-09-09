import { Suspense, lazy } from "react";
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import { Routes, Route } from 'react-router-dom';
import LoadingIndicator from './components/common/LoadingIndicator';

const Calendar = lazy(() => import('./components/Calendar/Calendar.tsx'));
const Login = lazy(() => import('./components/Login/Login.tsx'));
const SignUp = lazy(() => import('./components/Signup/Signup.tsx'));

function App() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <h1>Calendar Third</h1>
      <Routes>
          <Route
            path="/"
            element={<ProtectedRoute />}
          >
            <Route path="/calendar" element={<Calendar />} />
          </Route>
        <Route path="*" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Suspense>
  )
}

export default App
