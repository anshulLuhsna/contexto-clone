
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button, Select } from 'flowbite-react';
import { Label, TextInput } from 'flowbite-react';
import "../styles.css"
import "../custom.css";

import wordVectors1 from '../resources/words.json';
import wordVectors2 from '../resources/word2.json';

interface WordVector {
  word: string;
  similarity: number;
  rank: number;
}



interface MyComponentState {
  inputValue: string;
  selectedLevel: number;
  levels: number[];
  correctWords: Record<number, string>; 
  showEnteredWord: boolean;
  guessArray: { word: string; rank: number | null }[];
  showCorrectAnswer: boolean;
  rank: number | null;
  correctWordEntered: boolean;
}

const About: React.FC = () => {
  const [state, setState] = useState<MyComponentState>({
    inputValue: '',
    selectedLevel: 1,
    levels: Array.from({ length: 10 }, (_, i) => i + 1),
    correctWords: {
      1: 'innate',
      2: 'bask',
      
    },
    showEnteredWord: false,
    guessArray: [],
    showCorrectAnswer: false,
    rank: null,
    correctWordEntered: false,
  });

  useEffect(() => {
    if (state.correctWordEntered) {
  
      const timeoutId = setTimeout(() => {
        handleLevelChange(state.selectedLevel + 1);
        setState((prevState) => ({ ...prevState, correctWordEntered: false }));
      }, 5000);

  
      return () => clearTimeout(timeoutId);
    }
  }, [state.correctWordEntered]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
  
    setState({ ...state, inputValue: event.target.value });
  };

  const handleLevelChange = (value: number) => {
 
    setState({ ...state, selectedLevel: value, inputValue: '', guessArray: [], showEnteredWord: false, showCorrectAnswer: false, rank: null });
  };

  const handleAddToGuessArray = async () => {
    
    if (!state.guessArray.some((item) => item.word === state.inputValue)) {
      const rank = await fetchRank(state.inputValue);
      const updatedGuessArray = [...state.guessArray, { word: state.inputValue, rank }];

     
      updatedGuessArray.sort((a, b) => {
        if (a.rank === null && b.rank === null) {
          return 0;
        }
        if (a.rank === null) {
          return 1;
        }
        if (b.rank === null) {
          return -1;
        }
        return a.rank - b.rank;
      });

      setState({
        ...state,
        showEnteredWord: true,
        guessArray: updatedGuessArray,
        correctWordEntered: state.correctWords[state.selectedLevel] === state.inputValue,
      });
    }
  };

  const handleShowCorrectAnswer = () => {
    setState({ ...state, showCorrectAnswer: true });
  };

  const fetchRank = (word: string): Promise<number | null> => {
  
    const wordVectors = state.selectedLevel === 1 ? wordVectors1 : wordVectors2;

    return new Promise<number | null>((resolve) => {
     
      const foundWord = (wordVectors as WordVector[]).find((item) => item.word === word);
      resolve(foundWord ? foundWord.rank : null);
    });
  };

  const getRankColor = (rank: number | null): string => {
    if (rank !== null) {

      const maxRank = 10000;
  
     
      const normalizedRank = Math.min(rank / maxRank, 1);
  

      const r = Math.round(255 * normalizedRank);
      const g = Math.round(255 * (1 - normalizedRank));
      const b = 0;
  
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    return 'red';
  };
  

  return (
    <div>
      <h1 className='text-center mt-12'>CONTEXTO FOR MUMBO</h1>


      <div className="flex justify-center mt-8">
        <select
          value={state.selectedLevel}
          onChange={(event) => handleLevelChange(Number(event.target.value))}
          className='text-black mt-6'
        >
          {state.levels.map((level) => (
            <option key={level} value={level}>
              Level {level}
            </option>
          ))}
        </select>
      </div>

      
      <div className="flex justify-center mt-4 flex-col items-center">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="small" value="Enter word" />
          </div>
          <div className="bg-black">
            <TextInput
              onChange={handleInputChange}
              id="small"
              type="text"
              sizing="sm"
              className='text-white bg-black'
            />
          </div>
        </div>
        <Button onClick={handleAddToGuessArray} className="mt-6">
          Enter
        </Button>
        
      </div>

      

      {state.guessArray.length > 0 && (
        <div className="text-center mt-4 flex flex-col items-center text-black">
          <p className='text-white'>Guessed Words with Ranks:</p>
          {state.guessArray.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: getRankColor(item.rank),
                padding: '10px',
                margin: '5px',
                display: 'inline-block',
                
              }}
            >
              {item.word} - Rank: {item.rank !== null ? item.rank : 'NOPE'}
            </div>
          ))}
        </div>
      )}

      {state.showCorrectAnswer && (
        <div className="text-center mt-4">
          <p>Correct Answer: {state.correctWords[state.selectedLevel]}</p>
        </div>
      )}

      {state.rank !== null && (
        <div className="text-center mt-4 text-gray-400">
          <p>Rank for "{state.inputValue}": {state.rank}</p>
        </div>
      )}

      {state.correctWordEntered && (
        <div className="text-center ">
          <p>Correct word entered! Moving to the next level...</p>
        </div>
      )}
    </div>
  );
};

export default About;
