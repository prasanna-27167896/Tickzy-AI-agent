import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VideoPage from './VideoPage';

const HomePage = () => {
  const [input, setInput] = useState(''); 
  const location=useLocation();
  const {email,ticketId}=location.state||{};
  console.log(email);
  console.log(location.state);
  
  console.log(ticketId);
  
  const navigate = useNavigate();

  const submitHandler = () => {
    if (input.trim()) {
      navigate(`/room/${input}`,{
        state:{
            recieverEmail:email,
            ticketId
        }
      });
    }
  };

  return (
    <>
    <div className="h-screen flex items-center justify-center -mt-16 px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        <h1 className="text-white text-2xl font-semibold mb-6 text-center">
          🔗 Create a Room
        </h1>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your name..."
          className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />

        <button
          onClick={submitHandler}
          className="mt-4 w-full py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-medium transition duration-200"
        >
          Join Room
        </button>
      </div>
    </div>
    
    </>
  );
};

export default HomePage;
