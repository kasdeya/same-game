import { useState } from 'react'

const COLORS: Record<string | number, string | number> = {
  0: 'bg-yellow-500',
  1: 'bg-red-500',
  2: 'bg-blue-500'
}
function Board () {
  const numRows = 10
  const numCols = 10
  const [matchingPieces] = useState(new Set())
  // const [matrix, setMatrix] = useState<number[][] | string[][]>(
  const [matrix, setMatrix] = useState<any>(
    Array.from(
      { length: numRows },
      () =>
        Array.from(
          { length: numCols },
          () => Math.floor(Math.random() * 3)
        )
    )
  )

  const removeAndShiftPieces = (startRow: number, startCol: number) => {
    // get value of the piece to be removed
    const pieceValue = matrix[startRow][startCol]

    // create set to track visited pieces
    const visited = new Set()

    //  directions (up, down, left, right)
    const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

    // recursively explore and mark connected pieces
    const explore = (row: number, col: number) => {
      // check if the current position is out of bounds or dont match the piece value
      if (
        row < 0 || row >= 10 || col < 0 || col >= 10 ||
        matrix[row][col] !== pieceValue || visited.has(`${row}-${col}`)
      ) {
        return
      }

      // add piece to visited
      visited.add(`${row}-${col}`)

      // do it on all directions
      for (const dir of DIRECTIONS) {
        const [y, x] = dir
        explore(row + y, col + x)
      }
    }

    // start finding matches on clickd piece
    explore(startRow, startCol)

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
    for (let col = 0; col < 10; col++) {
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
    // let emptySpaces = 0
    const emptyCols = []
    for (let row = 9; row >= 0; row--) {
      for (let col = 9; col >= 0; col--) {
        if (newMatrix[row][col] === 'x') {
          // emptySpaces++
          emptyCols.push(col)
        }
      }
      // ????
      break
    }

    // console.log(emptyCols)
    // console.log(newMatrix)

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
    setMatrix(newMatrix)
  }

  return (
    <table>
      <tbody>
        {matrix.map((row: any, rowIndex: any) => (
          <tr key={rowIndex} className='transition-all'>
            {/* {rowIndex} */}
            {row.map((cell: any, cellIndex: any) => (
              <td
                key={cellIndex}
                className={` transition-all cursor-pointer p-2 ${
                  matchingPieces.has(`${rowIndex}-${cellIndex}`)
                    ? 'transparent'
                    : ''
                } ${cell !== '' ? COLORS[cell] : ''} `}
                onClick={() => {
                  removeAndShiftPieces(rowIndex, cellIndex)
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Board
