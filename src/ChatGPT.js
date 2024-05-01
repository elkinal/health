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
    <div style={{ maxWidth: '1000px', height: '500px', margin: 'auto', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      <div className="chat-window" style={{ border: '1px solid #ccc', borderRadius: '5px', minHeight: '300px', maxHeight: '100%', overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`} style={{ padding: '5px', borderBottom: '1px solid #eee', wordWrap: 'break-word' }}>
            <p style={{ margin: 0 }}>{message.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-input" style={{ display: 'flex', marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: '1', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginLeft: '10px', padding: '8px 15px', borderRadius: '5px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
};

export default ChatGPTForm;
