import './App.css'
import SocialCommercePlatform from './SocialCommercePlatform'
import { AppProvider } from './context/AppContext'

function App() {
  return (
    <AppProvider>
      <SocialCommercePlatform />
    </AppProvider>
  )
}

export default App
