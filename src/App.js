import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

function App() {
  const [newsData, setNewsData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const { transcript, resetTranscript } = useSpeechRecognition();

  const fetchWeatherData = async (location) => {
    const API_KEY = '9038c3df4c806a2a33e3d11ece85d6c0'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setWeatherData(data);

      // Analyze weather conditions and provide clothing recommendations
      const weatherType = data.weather[0].main;
      let clothingRecommendation = '';

      switch (weatherType) {
        case 'Clear':
          clothingRecommendation = "It's clear skies. Wear light clothes and sunglasses.";
          break;
        case 'Clouds':
          clothingRecommendation = "It's cloudy. Wear a Wind break jacket or stay at home.";
          break;
        case 'Rain':
          clothingRecommendation = "It's raining. Wear a waterproof jacket and boots.";
          break;
        case 'Snow':
          clothingRecommendation = "It's snowing. Wear warm layers, a hat, gloves, and boots.";
          break;
        default:
          clothingRecommendation = "Weather conditions are variable. Dress accordingly.";
      }

      // Speak the weather and clothing recommendation
      speak(`The weather in ${location} is ${data.weather[0].description}. ${clothingRecommendation}`);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchNewsData = async (category) => {
    try {
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=11db35c1a7fd47479285332046aafb24`);
      setNewsData(response.data.articles);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (transcript.toLowerCase().includes('business news')) {
      fetchNewsData('business');
      resetTranscript();
    } else if (transcript.toLowerCase().includes('general news')) {
      fetchNewsData('general');
      resetTranscript();
    } else if (transcript.toLowerCase().includes('sports news')) {
      fetchNewsData('sports');
      resetTranscript();
    } else if (transcript.toLowerCase().includes('weather in')) {
      const location = transcript.split('weather in')[1]?.trim();
      if (location) {
        fetchWeatherData(location);
        resetTranscript();
      }
    }
  }, [transcript, resetTranscript]);

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <div>Your browser does not support speech recognition. Please use a supported browser.</div>;
  }

  const startListening = () => {
    SpeechRecognition.startListening();
  };

  return (
    <div className="App">
      <h1>Voice Controlled News</h1>
      <button onClick={startListening}>Start Listening</button>
      <div className="news-container">
        {newsData.map((article, index) => (
          <div key={index} className="article">
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">Read More</a>
          </div>
        ))}
      </div>
      {weatherData && (
        <div className="weather-container">
          <h2>Weather Information</h2>
          <p>Location: {weatherData.name}</p>
          <p>Weather: {weatherData.weather[0].description}</p>
          <p>Temperature: {(weatherData.main.temp - 273.15).toFixed(0)}°C</p>
        </div>
      )}
    </div>
  );
}

export default App;
