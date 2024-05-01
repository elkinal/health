import React, { useState } from 'react';
import config from './credentials'; 

const ChatGPTForm = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newMessages = [...messages, { text: inputText, sender: 'user' }];
    setMessages(newMessages);
    
    try {
      // Make the API call
      const response = await fetch('https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': config.openAIKey
        },
        body: JSON.stringify({
          prompt: inputText,
          max_tokens: 200 
        })
      });

      const data = await response.json();
      
      // Check for errors in the response
      if (data.error) {
        console.error('Error from ChatGPT:', data.error.message);
        return;
      }
      
      if (data.choices && data.choices.length > 0) {
        let botResponse = data.choices[0].text.trim();
        
        // Ensure the last sentence ends coherently
        const lastSentenceEndIndex = botResponse.lastIndexOf('.');
        if (lastSentenceEndIndex !== -1) {
          botResponse = botResponse.substring(0, lastSentenceEndIndex + 1);
        }

        const updatedMessages = [...newMessages, { text: botResponse, sender: 'bot' }];
        setMessages(updatedMessages);
      } else {
        console.error('Invalid response from ChatGPT:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    
    setInputText('');
  };

  return (
    <div className='chart gpt-chart'>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-input">
        <input
          type="text"
          placeholder="Eg: Does my diet influence my sleep?"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit">Ask</button>
      </form>
    </div>
  );
};

export default ChatGPTForm;
