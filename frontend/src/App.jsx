import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import Header from './components/Header'
import DRDOApplicationForm from './pages/Form1'
import Form2 from './pages/Form2.jsx'
import ScientistDashboard from './pages/Dashboard.jsx'
// import Form3 from './pages/Form3.jsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Header /> */}
      <DRDOApplicationForm />
      {/* <Form2 /> */}
      {/* <Form3 /> */}
      {/* <ScientistDashboard/> */}
    </>
  )
}

export default App
