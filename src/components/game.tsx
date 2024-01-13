import React, { useState, useEffect, ChangeEvent, KeyboardEventHandler } from 'react';
import { Button, Select } from 'flowbite-react';
import { Label, TextInput } from 'flowbite-react';
import "../styles.css"
import "../custom.css";




import wordVectors1 from '../resources/word1.json';
import wordVectors2 from '../resources/word2.json';
import wordVectors3 from '../resources/word3.json';
import wordVectors4 from '../resources/word4.json';
import wordVectors5 from '../resources/word5.json';
import wordVectors6 from '../resources/word6.json';
import wordVectors7 from '../resources/word7.json';
import wordVectors8 from '../resources/word8.json';
import wordVectors9 from '../resources/word9.json';
import wordVectors10 from '../resources/word10.json';


interface WordVector {
  word: string;
  similarity: number;
  rank: number;
}

interface MyComponentState {
  inputValue: string;
  keyPress: string;
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
  const caesar_cipher_encrypt = (word: string, shift: number): string => {
    let encrypted_word = '';
    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (char.match(/[a-zA-Z]/)) {
            const code = word.charCodeAt(i);
            const isUpperCase = code >= 65 && code <= 90;

            char = String.fromCharCode(((code - (isUpperCase ? 65 : 97) + shift) % 26) + (isUpperCase ? 65 : 97));
        }
        encrypted_word += char;
    }
    return encrypted_word;
};

const caesar_cipher_decrypt = (word: string, shift: number): string => {
    let decrypted_word = '';
    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (char.match(/[a-zA-Z]/)) {
            const code = word.charCodeAt(i);
            const isUpperCase = code >= 65 && code <= 90;

            char = String.fromCharCode(((code - (isUpperCase ? 65 : 97) - shift + 26) % 26) + (isUpperCase ? 65 : 97));
        }
        decrypted_word += char;
    }
    return decrypted_word;
};


  const [state, setState] = useState<MyComponentState>({
    inputValue: '',
    keyPress: '',
    selectedLevel: 1,
    levels: Array.from({ length: 10 }, (_, i) => i + 1),
    correctWords: {
      1: "uhmxyhqdwh", //rejuvenate
      2: "lqqdwh", //innate
      3: "edvn", //bask
      4: "krph", //home
      5: "srhp", //poem
      6: "duw", // art
      7: "vhuhqglslwb", //serendipity
      8: "vxqvhw", //sunset
      9: "eolqg", //blind
      10: "jbp", //gym
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
    console.log(state.guessArray)
    console.log(state.inputValue)
    if (!state.guessArray.some((item) => caesar_cipher_decrypt(item.word,3) === state.inputValue)) {
      const rank = await fetchRank(state.inputValue);
      const encryptedWord = caesar_cipher_encrypt(state.inputValue, 3); // Encrypting the input word
      const updatedGuessArray = [...state.guessArray, { word: encryptedWord, rank }];
  
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
  
      // console.log(caesar_cipher_decrypt(state.correctWords[state.selectedLevel], 3))
      let correctWordEntered = caesar_cipher_decrypt(state.correctWords[state.selectedLevel], 3) === state.inputValue;
  
      setState({
        ...state,
        showEnteredWord: true,
        guessArray: updatedGuessArray,
        correctWordEntered: correctWordEntered,
      });
  
      // Delay the level change to ensure that correctWordEntered has been set in state
      setTimeout(() => {
        if (correctWordEntered) {
          handleLevelChange(state.selectedLevel + 1);
        }
      }, 5000);

      setState((prevState) => ({ ...prevState, inputValue: '' }));


    }
  };
  


  const handleShowCorrectAnswer = () => {
    setState({ ...state, showCorrectAnswer: true });
  };

  const fetchRank = (word: string): Promise<number | null> => {
    const wordVectorsArray = [
      wordVectors1,
      wordVectors2,
      wordVectors3,
      wordVectors4,
      wordVectors5,
      wordVectors6,
      wordVectors7,
      wordVectors8,
      wordVectors9,
      wordVectors10,
    ];
    const wordVectors = wordVectorsArray[state.selectedLevel - 1];
    return new Promise<number | null>((resolve) => {
        const encryptedInput = caesar_cipher_encrypt(word.trim(), 3);
        console.log('Trimmed Encrypted Input:', encryptedInput);

        const foundWord = (wordVectors as WordVector[]).find((item) => {
            const decryptedWord = caesar_cipher_decrypt(item.word, 3).trim();
            console.log('Trimmed Decrypted Word in File:', decryptedWord);

            // Compare the trimmed, encrypted user input with the trimmed, encrypted word in the file
            return item.word.trim() === encryptedInput;
        });

        // Log the found word and its rank to the console for debugging
        console.log('Found Word:', foundWord);

        // Resolve with the rank or null
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

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddToGuessArray();

    }
  };


  return (
    <div>
      <h1 className='text-center mt-12'>CONTEXTO</h1>


      <div className="flex justify-center mt-4">
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
          <div className="mb-2 block mt-4">
            <Label htmlFor="small" value="Enter word" className='text-white text-xl text-center mt-4' />
          </div>
          <div className="text-white">
            <TextInput
            value={state.inputValue}
              onChange={handleInputChange}
              onKeyDown={(e)=>handleKeyPress(e)}
              id="small"
              type="text"
              sizing="sm"
              className='text-white text-2xl'
            />
          </div>
        </div>
        <Button onClick={handleAddToGuessArray} className="mt-6 bg-zinc-700">
          Enter
        </Button>
        
      </div>

      {state.showCorrectAnswer && (
        <div className="text-center mt-4">
          <p>Correct Answer: {caesar_cipher_decrypt(state.correctWords[state.selectedLevel],3)}</p>
        </div>
      )}

      {state.rank !== null && (
        <div className="text-center mt-4 text-gray-400">
          <p>Rank for "{state.inputValue}": {state.rank}</p>
        </div>
      )}

      {state.correctWordEntered && (
        <div className="text-center mt-4">
          <p>Correct word entered! Moving to the next level...</p>
        </div>
      )}

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
              {caesar_cipher_decrypt(item.word,3)} - Rank: {item.rank !== null ? item.rank : 'NOPE'}
            </div>
          ))}
        </div>
      )}

      
    </div>
  );
};

export default About;
