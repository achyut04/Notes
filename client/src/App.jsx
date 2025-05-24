import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import NotesApp from './NotesApp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <NotesApp />
       </div>
    </>
  )
}

export default App
