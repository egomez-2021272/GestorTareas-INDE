import { Toaster } from 'react-hot-toast';
import { LoginForm } from '../features/auth/components/LoginForm';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <LoginForm />
    </>
  );
}
export default App;