import { BrowserRouter } from 'react-router-dom'
import AppRoute from './routes/application.routes'
import './styles/index.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoute />
      </BrowserRouter>
    </>
  )
}

export default App;
