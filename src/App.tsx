import './App.css'
import Board from './components/Board'
import { ModeToggle } from './components/mode-toggle'

function App () {
  return (
    <div className=''>
      <h1>SameGame</h1>
      <ModeToggle />
      <Board />
    </div>
  )
}

export default App
