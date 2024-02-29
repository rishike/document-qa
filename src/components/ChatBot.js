import React, { useState } from 'react';
import { getSessionId } from '../sessionManager';
import axios from 'axios';


const Chatbot = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  
  const askUrl = "http://127.0.0.1:8000/user_question";

  const handleNewEntry = (entry) => {
    setHistory(prev => [...prev, entry]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== '') {
      handleNewEntry(input.trim());
      setInput('');
    }
  };

  const handleAskQuestion = async () => {
    if (!input.trim()) {
      alert('Please enter a question.');
      return;
    }

    const newEntry = { question: input.trim(), answer: 'Processing...' };
    setHistory(prev => [...prev, newEntry]); // Add question immediately to history
    setInput(''); // Clear input field

    setIsProcessing(true);
    try {
      const sessionId = getSessionId();
      const response = await axios.post(askUrl, { "question": input, 'session_id': sessionId });
      const answer = response.data && response.data.answer ? response.data.answer : 'Sorry, I could not find an answer to your question.';
      setAnswer(answer); 

      setHistory(prev => prev.map((entry, index) => 
        index === prev.length - 1 ? { ...entry, answer: answer } : entry
      ));
    } catch (error) {
      console.error('Error asking question:', error);
      // Update answer with error message
      setHistory(prev => prev.map((entry, index) => 
        index === prev.length - 1 ? { ...entry, answer: 'An error occurred while trying to process your question.' } : entry
      ));
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="flex h-screen">
      {/* History Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">History</h2>
        <ul>
          {history.map((entry, index) => (
            <li key={index} className="mb-2">
            <p>{entry.question}</p>
            </li>
          ))}
        </ul>
      </div>


      <div className="flex flex-col w-3/4 p-4 bg-slate-200">
      <div className="h-3/4 p-4 overflow-y-auto">
          {history.map((entry, index) => (
            <div key={index} className="mb-4">
              <p className="text-lg font-semibold">Q: {entry.question}</p>
              <div className="p-4 rounded shadow-sm bg-slate-100">
                <p className="text-lg">A: {entry.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <textarea
            className="resize-none border p-2 w-full mr-4"
            placeholder="Type your question (max 1000 words)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength="1000" 
            disabled={isProcessing}
          />
          <button
            onClick={handleAskQuestion}
            className={`mt-4 p-2 text-white ${isProcessing ? 'bg-blue-300' : 'bg-blue-500'}`}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
