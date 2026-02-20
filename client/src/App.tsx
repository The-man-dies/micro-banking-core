import { BrowserRouter } from 'react-router-dom'
import AppRoute from '@/routes/AppRoute'
import './styles/index.css'
import AuthManager from './features/auth/AuthManager' // Import AuthManager

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthManager> {/* Wrap AppRoute with AuthManager */}
          <AppRoute />
        </AuthManager>
      </BrowserRouter>
    </>
  )
}

export default App;
