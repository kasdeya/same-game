import { useEffect, useState } from 'react'
import '../index.css'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import { Button } from './ui/button'

//  directions (up, down, left, right)
const DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
]

const NUM_ROWS = 10
const NUM_COLS = 20

const COLORS: Record<string | number, string | number> = {
  // 0: 'bg-yellow-500',
  0: 'bg-[radial-gradient(circle_at_50%_120%,_#cccccc,_#ffc800,_80%,_#cccccc_100%)]',
  // 1: 'bg-red-500',
  1: 'bg-[radial-gradient(circle_at_50%_120%,_#cccccc,_#f44336,_80%,_#cccccc_100%)]',
  // 2: 'bg-blue-500'
  2: 'bg-[radial-gradient(circle_at_50%_120%,_#cccccc,_#0086ff,_80%,_#cccccc_100%)]',
  3: 'bg-[radial-gradient(circle_at_50%_120%,_#cccccc,_#ff0098,_80%,_#cccccc_100%)]',
  4: 'bg-[radial-gradient(circle_at_50%_120%,_#cccccc,_#9e37ff,_80%,_#cccccc_100%)]'
}

// type Coordinate = [number, number]
// type CoordinatesType = Coordinate[]
type BoardType = number[][] | string[][]

function Board () {
  // const [removed, setRemoved] = useState<Coordinate[]>([])
  // const [removedPerimeter, setRemovedPerimeter] = useState<CoordinatesType[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [numberOfColors, setNumberOfColors] = useState(3)
  // const [matchingPieces, setMatchingPieces] = useState(new Set())
  // const cssStyle = ${matchingPieces.has(`${rowIndex}-${cellIndex}`) ? 'opacity-0': ''}
  // const [matrix, setMatrix] = useState<number[][] | string[][]>(
  const [matrix, setMatrix] = useState<BoardType>(
    Array.from({ length: NUM_ROWS }, () =>
      Array.from({ length: NUM_COLS }, () =>
        Math.floor(Math.random() * numberOfColors)
      )
    )
  )

  const handleNextLevel = () => {
    setNumberOfColors((prevNumberOfColors) => {
      const updatedNumberOfColors = prevNumberOfColors + 1
      handleRestartGame(updatedNumberOfColors) // Pass the updated number of colors as an argument
      return updatedNumberOfColors
    })
  }

  const handleRestartGame = (newNumberOfColors: number) => {
  // Accept the newNumberOfColors as a parameter
    setMatrix(
      Array.from({ length: NUM_ROWS }, () =>
        Array.from(
          { length: NUM_COLS },
          () => Math.floor(Math.random() * newNumberOfColors) // Use newNumberOfColors here
        )
      )
    )
    setGameOver(false)
    setGameWon(false)
  }

  const checkWin = (board: BoardType) => {
    // iterate through rows
    for (let i = 0; i < board.length; i++) {
      // iterate through columns in each row
      for (let j = 0; j < board[i].length; j++) {
        // if any element is not 'x', return false
        if (board[i][j] !== 'x') {
          return false
        }
      }
    }
    // if all elements are 'x', return true
    setGameWon(true)
    console.log('GAME WON')
    return true
  }

  const checkIsLost = (matrix: BoardType) => {
    for (let row = 0; row < NUM_ROWS; row++) {
      for (let col = 0; col < NUM_COLS; col++) {
        const currentValue = matrix[row][col]

        if (currentValue === 'x') {
          continue
        }

        // check adjacent positions
        for (const [dx, dy] of DIRECTIONS) {
          const newRow = row + dx
          const newCol = col + dy

          // check if the neighboring position is within bounds
          if (
            newRow >= 0 &&
            newRow < NUM_ROWS &&
            newCol >= 0 &&
            newCol < NUM_COLS &&
            matrix[newRow][newCol] === currentValue
          ) {
            return true // Found an adjacent match
          }
        }
      }
    }
    setGameOver(true)
    checkWin(matrix)
    return false
  }

  const removeAndShiftPieces = (startRow: number, startCol: number) => {
    if (gameOver) return
    // get value of the piece to be removed
    const pieceValue = matrix[startRow][startCol]

    // create set to track visited pieces
    const visited = new Set<string>()

    // recursively explore and mark connected pieces
    const explore = ({ row, col }: { row: number, col: number }) => {
      // check if the current position is out of bounds or dont match the piece value
      if (
        row < 0 ||
        row >= 10 ||
        col < 0 ||
        col >= NUM_COLS ||
        matrix[row][col] !== pieceValue ||
        visited.has(`${row}-${col}`)
      ) {
        return
      }

      visited.add(`${row}-${col}`)

      // add piece to visited

      // removed.push([row, col])
      // setRemoved(prev => [...prev, [row, col]])

      // do it on all directions
      for (const dir of DIRECTIONS) {
        const [y, x] = dir
        explore({ row: row + y, col: col + x })
      }
    }
    // start finding matches on clickd piece
    explore({ row: startRow, col: startCol })

    if (visited.size === 1) {
      // if only one piece (the clicked piece) is visited, its a single piece
      // with no matches
      // console.log('game over no more valid moves')
      return
    }

    // copy of the matrix
    const newMatrix = [...matrix]

    // remove matching pieces from board
    visited.forEach((coord: any) => {
      const [row, col] = coord.split('-').map(Number)
      newMatrix[row][col] = 'x'
    })

    // shift pieces down to fill vertical empty space
    for (let col = 0; col < NUM_COLS; col++) {
      let emptySpaces = 0
      for (let row = 9; row >= 0; row--) {
        if (newMatrix[row][col] === 'x') {
          emptySpaces++
        } else if (emptySpaces > 0) {
          newMatrix[row + emptySpaces][col] = newMatrix[row][col]
          newMatrix[row][col] = 'x'
        }
      }
    }

    // shift columns horizontally to fill horizontal empty
    const emptyCols = []
    for (let row = 9; row >= 9; row--) {
      for (let col = NUM_COLS - 1; col >= 0; col--) {
        if (newMatrix[row][col] === 'x') {
          emptyCols.push(col)
        }
      }
    }

    // grab first column that is empty
    // look for next column that is NOT empty
    // swap em
    // grab next empty column
    // do the same

    if (emptyCols.length > 0) {
      for (let startCol = emptyCols[0]; startCol >= 0; startCol--) {
        let nextNotEmptyCol = 0
        // let nextEmptyCol = startCol

        // look for next NOT empty column
        for (let ycol = startCol; ycol >= 0; ycol--) {
          if (newMatrix[9][ycol] !== 'x') {
            nextNotEmptyCol = ycol
            break
          }
        }

        // replace emptyCol with the NOTEmpty col
        for (let xrow = 9; xrow >= 0; xrow--) {
          newMatrix[xrow][startCol] = newMatrix[xrow][nextNotEmptyCol]
          newMatrix[xrow][nextNotEmptyCol] = 'x'
        }
      }
    }

    // update the board with the new one
    setMatrix(newMatrix as BoardType)
    if (!checkIsLost(newMatrix as BoardType)) {
      console.log('GAME OVER')
    }
  }

  return (
    <>
      <section className="flex flex-col gap-1 rounded-md overflow-hidden">
        {matrix.map((row: any, rowIndex: any) => (
          <div
            key={rowIndex}
            className="grid grid-cols-[repeat(20,_minmax(0,_1fr))] gap-1 transition-all ">
            {/* {rowIndex} */}
            {row.map((cell: any, cellIndex: any) => (
              <div
                key={cellIndex}
                className={`border cursor-pointer p-4 ${
                  cell !== 'x' ? COLORS[cell] : ''
                } `}
                onClick={() => {
                  removeAndShiftPieces(rowIndex, cellIndex)
                }}>
                {/* {cell} */}
              </div>
            ))}
          </div>
        ))}
      </section>
      {gameOver && (
        <AlertDialog open={gameOver}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Game Over</AlertDialogTitle>
              <AlertDialogDescription>
                {gameWon ? "You've WON!" : "You've LOST!"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {gameWon && (
              <Button
                variant={'default'}
                onClick={handleNextLevel}>
                Next Level
              </Button>
            )}
            <Button
              variant={'default'}
              onClick={() => { handleRestartGame(numberOfColors) }}>
              Restart Level
            </Button>
            <Button variant={'default'}>Menu</Button>
            <AlertDialogFooter></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default Board
