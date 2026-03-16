/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUp, 
  RotateCcw, 
  RotateCw, 
  Repeat, 
  Play, 
  Trash2, 
  Trophy, 
  RefreshCw,
  ChevronRight,
  Bot,
  HelpCircle
} from 'lucide-react';

// --- Types ---

type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

interface Position {
  x: number;
  y: number;
}

type ActionType = 'MOVE' | 'LEFT' | 'RIGHT' | 'REPEAT';

interface ActionBlock {
  id: string;
  type: ActionType;
  value?: number; // For repeat
  nestedActions?: ActionBlock[]; // For repeat
}

interface Level {
  id: number;
  gridSize: number;
  startPos: Position;
  startDir: Direction;
  targetPos: Position;
  obstacles: Position[];
  availableBlocks: ActionType[];
  solution: ActionBlock[];
}

// --- Constants ---

const LEVELS: Level[] = [
  {
    id: 1,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    startDir: 'UP',
    targetPos: { x: 0, y: 0 },
    obstacles: [],
    availableBlocks: ['MOVE'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
    ]
  },
  {
    id: 2,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    startDir: 'RIGHT',
    targetPos: { x: 4, y: 4 },
    obstacles: [{ x: 2, y: 4 }],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    solution: [
      { id: 's1', type: 'LEFT' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'RIGHT' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'MOVE' },
      { id: 's6', type: 'MOVE' },
      { id: 's7', type: 'MOVE' },
      { id: 's8', type: 'RIGHT' },
      { id: 's9', type: 'MOVE' },
    ]
  },
  {
    id: 3,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    startDir: 'UP',
    targetPos: { x: 4, y: 0 },
    obstacles: [
      { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'RIGHT' },
      { id: 's6', type: 'REPEAT', value: 4, nestedActions: [{ id: 'n1', type: 'MOVE' }] }
    ]
  },
  {
    id: 4,
    gridSize: 6,
    startPos: { x: 0, y: 5 },
    startDir: 'UP',
    targetPos: { x: 5, y: 0 },
    obstacles: [
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'RIGHT' },
      { id: 's4', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's5', type: 'LEFT' },
      { id: 's6', type: 'REPEAT', value: 3, nestedActions: [{ id: 'n1', type: 'MOVE' }] }
    ]
  },
  {
    id: 5,
    gridSize: 6,
    startPos: { x: 0, y: 5 },
    startDir: 'UP',
    targetPos: { x: 5, y: 0 },
    obstacles: [
      { x: 1, y: 5 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 },
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
      { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'MOVE' },
      { id: 's6', type: 'RIGHT' },
      { id: 's7', type: 'MOVE' },
      { id: 's8', type: 'MOVE' },
      { id: 's9', type: 'RIGHT' },
      { id: 's10', type: 'MOVE' },
      { id: 's11', type: 'MOVE' },
      { id: 's12', type: 'MOVE' },
      { id: 's13', type: 'MOVE' },
      { id: 's14', type: 'LEFT' },
      { id: 's15', type: 'MOVE' },
      { id: 's16', type: 'MOVE' },
      { id: 's17', type: 'LEFT' },
      { id: 's18', type: 'MOVE' },
      { id: 's19', type: 'MOVE' },
      { id: 's20', type: 'MOVE' },
      { id: 's21', type: 'MOVE' }
    ]
  },
  {
    id: 6,
    gridSize: 7,
    startPos: { x: 0, y: 6 },
    startDir: 'UP',
    targetPos: { x: 6, y: 0 },
    obstacles: [
      { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 6 },
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'REPEAT', value: 6, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's2', type: 'RIGHT' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'RIGHT' },
      { id: 's6', type: 'REPEAT', value: 6, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's7', type: 'LEFT' },
      { id: 's8', type: 'MOVE' },
      { id: 's9', type: 'MOVE' },
      { id: 's10', type: 'LEFT' },
      { id: 's11', type: 'REPEAT', value: 6, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's12', type: 'RIGHT' },
      { id: 's13', type: 'MOVE' },
      { id: 's14', type: 'MOVE' }
    ]
  },
  {
    id: 7,
    gridSize: 8,
    startPos: { x: 0, y: 7 },
    startDir: 'UP',
    targetPos: { x: 7, y: 0 },
    obstacles: [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'RIGHT' },
      { id: 's4', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's5', type: 'LEFT' },
      { id: 's6', type: 'MOVE' },
      { id: 's7', type: 'MOVE' },
      { id: 's8', type: 'LEFT' },
      { id: 's9', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's10', type: 'RIGHT' },
      { id: 's11', type: 'MOVE' },
      { id: 's12', type: 'MOVE' },
      { id: 's13', type: 'RIGHT' },
      { id: 's14', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's15', type: 'LEFT' },
      { id: 's16', type: 'MOVE' }
    ]
  },
  {
    id: 8,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    startDir: 'UP',
    targetPos: { x: 4, y: 0 },
    obstacles: [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 },
      { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'MOVE' },
      { id: 's2', type: 'MOVE' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'RIGHT' },
      { id: 's6', type: 'MOVE' },
      { id: 's7', type: 'MOVE' },
      { id: 's8', type: 'RIGHT' },
      { id: 's9', type: 'MOVE' },
      { id: 's10', type: 'MOVE' },
      { id: 's11', type: 'MOVE' },
      { id: 's12', type: 'MOVE' },
      { id: 's13', type: 'LEFT' },
      { id: 's14', type: 'MOVE' },
      { id: 's15', type: 'MOVE' },
      { id: 's16', type: 'LEFT' },
      { id: 's17', type: 'MOVE' },
      { id: 's18', type: 'MOVE' },
      { id: 's19', type: 'MOVE' },
      { id: 's20', type: 'MOVE' }
    ]
  },
  {
    id: 9,
    gridSize: 6,
    startPos: { x: 0, y: 0 },
    startDir: 'RIGHT',
    targetPos: { x: 5, y: 5 },
    obstacles: [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
      { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 },
      { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's2', type: 'RIGHT' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'RIGHT' },
      { id: 's5', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's6', type: 'LEFT' },
      { id: 's7', type: 'MOVE' },
      { id: 's8', type: 'LEFT' },
      { id: 's9', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's10', type: 'RIGHT' },
      { id: 's11', type: 'MOVE' },
      { id: 's12', type: 'RIGHT' },
      { id: 's13', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's14', type: 'LEFT' },
      { id: 's15', type: 'MOVE' },
      { id: 's16', type: 'LEFT' },
      { id: 's17', type: 'REPEAT', value: 5, nestedActions: [{ id: 'n1', type: 'MOVE' }] }
    ]
  },
  {
    id: 10,
    gridSize: 8,
    startPos: { x: 0, y: 7 },
    startDir: 'UP',
    targetPos: { x: 7, y: 0 },
    obstacles: [
      { x: 1, y: 7 }, { x: 1, y: 6 }, { x: 1, y: 5 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 },
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
      { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 },
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }
    ],
    availableBlocks: ['MOVE', 'LEFT', 'RIGHT', 'REPEAT'],
    solution: [
      { id: 's1', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's2', type: 'RIGHT' },
      { id: 's3', type: 'MOVE' },
      { id: 's4', type: 'MOVE' },
      { id: 's5', type: 'RIGHT' },
      { id: 's6', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's7', type: 'LEFT' },
      { id: 's8', type: 'MOVE' },
      { id: 's9', type: 'MOVE' },
      { id: 's10', type: 'LEFT' },
      { id: 's11', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] },
      { id: 's12', type: 'RIGHT' },
      { id: 's13', type: 'MOVE' },
      { id: 's14', type: 'MOVE' },
      { id: 's15', type: 'RIGHT' },
      { id: 's16', type: 'REPEAT', value: 7, nestedActions: [{ id: 'n1', type: 'MOVE' }] }
    ]
  }
];

const GRID_SIZE_PX = 350;

const MARIO_CHARACTERS = [
  { name: 'Mario', icon: 'https://img.icons8.com/color/144/mario.png' },
  { name: 'Luigi', icon: 'https://img.icons8.com/color/144/luigi.png' },
  { name: 'Peach', icon: 'https://img.icons8.com/color/144/princess-peach.png' },
  { name: 'Yoshi', icon: 'https://img.icons8.com/color/144/yoshi.png' },
  { name: 'Toad', icon: 'https://img.icons8.com/color/144/toad.png' },
  { name: 'Bowser', icon: 'https://img.icons8.com/color/144/bowser.png' },
  { name: 'Wario', icon: 'https://img.icons8.com/color/144/wario.png' },
  { name: 'Donkey Kong', icon: 'https://img.icons8.com/color/144/donkey-kong.png' },
];

const FALLBACK_CHARACTER_URL = "https://img.icons8.com/color/144/super-mario.png";
const COIN_URL = "https://img.icons8.com/color/144/mario-coin.png";
const FALLBACK_COIN_URL = "https://img.icons8.com/color/144/star--v1.png";

// --- Components ---

export default function App() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [program, setProgram] = useState<ActionBlock[]>([]);
  const [robotPos, setRobotPos] = useState<Position>(LEVELS[0].startPos);
  const [robotDir, setRobotDir] = useState<Direction>(LEVELS[0].startDir);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(-1);
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [draggedBlock, setDraggedBlock] = useState<ActionType | null>(null);
  const [boardWidth, setBoardWidth] = useState(350);
  const [character, setCharacter] = useState(MARIO_CHARACTERS[0]);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current && boardRef.current.offsetWidth > 0) {
        setBoardWidth(boardRef.current.offsetWidth);
      }
    };
    updateSize();
    // Use a small timeout to ensure layout is complete
    const timer = setTimeout(updateSize, 100);
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timer);
    };
  }, []);

  const level = LEVELS[currentLevelIdx];
  const cellSize = boardWidth / level.gridSize;

  // Reset level
  const resetLevel = useCallback(() => {
    setRobotPos(level.startPos);
    setRobotDir(level.startDir);
    setGameState('IDLE');
    setExecutionStep(-1);
    setIsExecuting(false);
  }, [level]);

  useEffect(() => {
    resetLevel();
    setProgram([]);
    // Pick a random character for the new level
    const randomChar = MARIO_CHARACTERS[Math.floor(Math.random() * MARIO_CHARACTERS.length)];
    setCharacter(randomChar);
  }, [currentLevelIdx, resetLevel]);

  // Execution Logic
  const runProgram = async (programToRun = program) => {
    if (programToRun.length === 0 || isExecuting) return;
    
    setIsExecuting(true);
    setGameState('RUNNING');
    
    let currentPos = { ...level.startPos };
    let currentDir = level.startDir;

    const flattenedActions: ActionType[] = [];
    programToRun.forEach(block => {
      if (block.type === 'REPEAT') {
        const count = block.value || 3;
        for (let i = 0; i < count; i++) {
          block.nestedActions?.forEach(nested => flattenedActions.push(nested.type));
        }
      } else {
        flattenedActions.push(block.type);
      }
    });

    for (let i = 0; i < flattenedActions.length; i++) {
      setExecutionStep(i);
      const action = flattenedActions[i];
      
      await new Promise(resolve => setTimeout(resolve, 600));

      if (action === 'MOVE') {
        const nextPos = { ...currentPos };
        if (currentDir === 'UP') nextPos.y -= 1;
        if (currentDir === 'RIGHT') nextPos.x += 1;
        if (currentDir === 'DOWN') nextPos.y += 1;
        if (currentDir === 'LEFT') nextPos.x -= 1;

        // Bounds check
        if (nextPos.x < 0 || nextPos.x >= level.gridSize || nextPos.y < 0 || nextPos.y >= level.gridSize) {
          setGameState('FAIL');
          setIsExecuting(false);
          return;
        }

        // Obstacle check
        if (level.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y)) {
          setGameState('FAIL');
          setIsExecuting(false);
          return;
        }

        currentPos = nextPos;
        setRobotPos(currentPos);
      } else if (action === 'LEFT') {
        const dirs: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
        const idx = dirs.indexOf(currentDir);
        currentDir = dirs[(idx + 1) % 4];
        setRobotDir(currentDir);
      } else if (action === 'RIGHT') {
        const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const idx = dirs.indexOf(currentDir);
        currentDir = dirs[(idx + 1) % 4];
        setRobotDir(currentDir);
      }

      // Check success
      if (currentPos.x === level.targetPos.x && currentPos.y === level.targetPos.y) {
        setGameState('SUCCESS');
        setIsExecuting(false);
        return;
      }
    }

    // If finished and not at target
    if (currentPos.x !== level.targetPos.x || currentPos.y !== level.targetPos.y) {
      setGameState('FAIL');
    }
    setIsExecuting(false);
  };

  const showHint = async () => {
    if (isExecuting) return;
    resetLevel();
    setProgram(level.solution);
    // We need to wait for state update or pass directly
    setTimeout(() => {
      runProgram(level.solution);
    }, 100);
  };

  const addBlock = (type: ActionType) => {
    if (isExecuting) return;
    const newBlock: ActionBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: type === 'REPEAT' ? 3 : undefined,
      nestedActions: type === 'REPEAT' ? [{ id: 'nested-1', type: 'MOVE' }] : undefined
    };
    setProgram([...program, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (isExecuting) return;
    setProgram(program.filter(b => b.id !== id));
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(currentLevelIdx + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#2D3436] font-sans p-4 md:p-8 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#E74C3C] p-2 rounded-2xl shadow-lg transform -rotate-3 border-4 border-white">
            <img 
              src="https://img.icons8.com/color/96/super-mario.png" 
              alt="Mario" 
              className="w-10 h-10"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#2D3436]">
            MARIO <span className="text-[#E74C3C]">CODE</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={showHint}
            disabled={isExecuting}
            className="flex items-center gap-2 bg-[#FFEAA7] text-[#F39C12] px-4 py-2 rounded-full font-black shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <HelpCircle className="w-5 h-5" /> HELP
          </button>
          <div className="bg-white px-6 py-2 rounded-full border-4 border-[#DFE6E9] font-bold text-xl shadow-sm">
            LEVEL {level.id}
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Toolbox & Program */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Toolbox */}
          <section className="bg-white p-6 rounded-[2rem] border-4 border-[#DFE6E9] shadow-xl">
            <h2 className="text-sm uppercase tracking-widest font-black text-[#B2BEC3] mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> ACTIONS
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {level.availableBlocks.map(type => (
                <ToolboxButton 
                  key={type} 
                  type={type} 
                  onClick={() => addBlock(type)} 
                  disabled={isExecuting}
                />
              ))}
            </div>
          </section>

          {/* Program Workspace */}
          <section className="bg-[#E1F5FE] p-6 rounded-[2rem] border-4 border-[#81D4FA] shadow-xl flex-grow min-h-[300px]">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm uppercase tracking-widest font-black text-[#0288D1] flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" /> YOUR CODE
                </h2>
                <button 
                  onClick={() => setProgram([])}
                  disabled={isExecuting || program.length === 0}
                  className="p-2 text-[#0288D1] hover:bg-[#B3E5FC] rounded-xl transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {program.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[#0288D1] text-center py-12 font-medium opacity-60 italic"
                    >
                      Tap blocks to build your path!
                    </motion.div>
                  )}
                  {program.map((block, idx) => (
                    <ProgramBlock 
                      key={block.id} 
                      block={block} 
                      isActive={isExecuting && executionStep === idx}
                      onRemove={() => removeBlock(block.id)}
                    />
                  ))}
                </AnimatePresence>
             </div>
          </section>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => runProgram()}
              disabled={isExecuting || program.length === 0}
              className={`flex-grow py-5 rounded-3xl font-black text-2xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isExecuting || program.length === 0
                  ? 'bg-[#DFE6E9] text-[#B2BEC3] cursor-not-allowed'
                  : 'bg-[#55EFC4] text-[#00B894] hover:bg-[#00B894] hover:text-white'
              }`}
            >
              <Play className="w-8 h-8 fill-current" /> GO!
            </button>
            <button
              onClick={resetLevel}
              className="p-5 bg-white border-4 border-[#DFE6E9] rounded-3xl text-[#636E72] hover:bg-[#F1F2F6] transition-all shadow-lg active:scale-95"
            >
              <RefreshCw className={`w-8 h-8 ${isExecuting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Game World */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div 
            ref={boardRef}
            className="relative bg-white rounded-[2.5rem] border-8 border-[#DFE6E9] shadow-2xl overflow-hidden w-full max-w-[500px] aspect-square"
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 grid" style={{ 
              gridTemplateColumns: `repeat(${level.gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${level.gridSize}, 1fr)`
            }}>
              {Array.from({ length: level.gridSize * level.gridSize }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-[#F1F2F6]" />
              ))}
            </div>

            {/* Obstacles */}
            {level.obstacles.map((obs, i) => (
              <div 
                key={i}
                className="absolute bg-[#FAB1A0] rounded-xl flex items-center justify-center"
                style={{
                  width: cellSize - 10,
                  height: cellSize - 10,
                  left: obs.x * cellSize + 5,
                  top: obs.y * cellSize + 5
                }}
              >
                <div className="w-1/2 h-1/2 bg-[#FF7675] rounded-full opacity-50" />
              </div>
            ))}

            {/* Target (Coin) */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotateY: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute flex items-center justify-center z-10"
              style={{
                width: cellSize,
                height: cellSize,
                left: robotPos.x === level.targetPos.x && robotPos.y === level.targetPos.y && gameState === 'SUCCESS' ? -1000 : level.targetPos.x * cellSize,
                top: level.targetPos.y * cellSize
              }}
            >
              <img 
                src={COIN_URL} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_COIN_URL;
                }}
                alt="Coin" 
                className="w-3/4 h-3/4 drop-shadow-md"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Character */}
            <motion.div
              animate={{ 
                x: robotPos.x * cellSize, 
                y: robotPos.y * cellSize,
                rotate: robotDir === 'UP' ? 0 : robotDir === 'RIGHT' ? 90 : robotDir === 'DOWN' ? 180 : 270
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute flex items-center justify-center z-20"
              style={{ width: cellSize, height: cellSize }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={character.icon} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_CHARACTER_URL;
                  }}
                  alt={character.name} 
                  className="w-4/5 h-4/5 drop-shadow-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            {/* Overlays */}
            <AnimatePresence>
              {gameState === 'SUCCESS' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-[#55EFC4]/90 flex flex-col items-center justify-center p-8 text-center z-20"
                >
                  <Trophy className="w-24 h-24 text-white mb-4" />
                  <h2 className="text-4xl font-black text-white mb-6">AMAZING!</h2>
                  <button 
                    onClick={nextLevel}
                    className="bg-white text-[#00B894] px-8 py-4 rounded-3xl font-black text-xl shadow-xl active:scale-95"
                  >
                    NEXT LEVEL
                  </button>
                </motion.div>
              )}
              {gameState === 'FAIL' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-[#FF7675]/90 flex flex-col items-center justify-center p-8 text-center z-20"
                >
                  <RefreshCw className="w-24 h-24 text-white mb-4" />
                  <h2 className="text-4xl font-black text-white mb-6">OOPS!</h2>
                  <button 
                    onClick={resetLevel}
                    className="bg-white text-[#D63031] px-8 py-4 rounded-3xl font-black text-xl shadow-xl active:scale-95"
                  >
                    TRY AGAIN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Level Instructions (Visual) */}
          <div className="mt-8 bg-white p-6 rounded-3xl border-4 border-[#DFE6E9] max-w-sm text-center">
            <p className="text-[#636E72] font-bold text-lg">
              Help the robot reach the trophy!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-[#B2BEC3] font-bold text-sm tracking-widest uppercase">
        Built for little coders 🚀
      </footer>
    </div>
  );
}

// --- Sub-components ---

function ToolboxButton({ type, onClick, disabled }: { type: ActionType, onClick: () => void, disabled: boolean }) {
  const config = {
    MOVE: { icon: ArrowUp, color: 'bg-[#74B9FF]', label: 'Move' },
    LEFT: { icon: RotateCcw, color: 'bg-[#A29BFE]', label: 'Left' },
    RIGHT: { icon: RotateCw, color: 'bg-[#81ECEC]', label: 'Right' },
    REPEAT: { icon: Repeat, color: 'bg-[#FAB1A0]', label: 'Loop' },
  }[type];

  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${config.color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale`}
    >
      <div className="bg-white/30 p-2 rounded-xl">
        <Icon className="text-white w-8 h-8" />
      </div>
      <span className="text-white font-black text-xs uppercase tracking-wider">{config.label}</span>
    </button>
  );
}

function ProgramBlock({ block, isActive, onRemove }: { block: ActionBlock, isActive: boolean, onRemove: () => void }) {
  const config = {
    MOVE: { icon: ArrowUp, color: 'bg-[#74B9FF]', label: 'Move' },
    LEFT: { icon: RotateCcw, color: 'bg-[#A29BFE]', label: 'Left' },
    RIGHT: { icon: RotateCw, color: 'bg-[#81ECEC]', label: 'Right' },
    REPEAT: { icon: Repeat, color: 'bg-[#FAB1A0]', label: 'Loop' },
  }[block.type];

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, scale: isActive ? 1.05 : 1 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${config.color} ${isActive ? 'ring-4 ring-white shadow-2xl' : 'shadow-md'} p-3 rounded-2xl flex items-center justify-between gap-4 border-2 border-white/20`}
    >
      <div className="flex items-center gap-3">
        <div className="bg-white/30 p-2 rounded-xl">
          <Icon className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black text-sm uppercase">{config.label}</span>
          {block.type === 'REPEAT' && (
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-tighter">3 Times: Move</span>
          )}
        </div>
      </div>
      <button 
        onClick={onRemove}
        className="text-white/50 hover:text-white transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
