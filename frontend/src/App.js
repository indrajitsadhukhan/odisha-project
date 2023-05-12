import React, { useState,useEffect } from "react";
import "./App.css";

import { useSpeechSynthesis } from "react-speech-kit";

import Mic from "./asset/micBtn.svg";
import Speak from "./asset/speak.jpg";

const BASE_URL ="http://localhost:8080";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechGrammarList = window.webkitSpeechGrammarList;


const mic = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList()

mic.continuous = false;
mic.interimResults = true;
mic.grammars=speechRecognitionList
mic.maxAlternatives=1

function App() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(" ");
  const [savedNote, setSavedNote] = useState("");
  const { speak, cancel } = useSpeechSynthesis();
  useEffect(() => {
    // Update the document title using the browser API
    cancel()
  });


  const handleListen = async (listenStatus) => {
    if (listenStatus) {
      setNote("");
      mic.start();
      mic.onend = () => {
        mic.start();
      };
      setSavedNote("Listening to your input...");
      cancel();
    } else {
      mic.stop();
      mic.onend = () => {};
      await handleSaveNote();
    }

    mic.onstart = () => {};
    mic.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setNote(transcript);
      mic.onerror = (event) => {
        console.log(event.error);
        setNote("");
      };
    };
  };

  async function askQuestion(prompt) {
    console.log("Question asked.")
    const response = await fetch(BASE_URL + "/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "What is pwc?",
      }),
    }).catch((err) => console.log(err));
    if (response?.ok) {
      const data = await response.json();
      const parsedData = data.result;
      return parsedData;
    } else return "I am sorry, could you say that again please";
  }

  const handleSaveNote = async () => {
    // Call OpenAI Apis using note
    setSavedNote("Processing your input...");
    const res = await askQuestion(note);
    setSavedNote(res.split("\n").map((str) => <p>{str}</p>));
    speak({ text: res });
  };

  const HandleSpeak = () => {
    setIsListening(!isListening);
    handleListen(!isListening);
  };

  return (
    <div className="main-div">
      <header>
        <h1 style={{ fontSize: 30 }}>Assistant on the Go</h1>
        <p>(Enabled with GPT)</p>
      </header>

      <section className="holder-section">
        <h2>Your transcript</h2>
        <div className="text-holder">
          <p>{note}</p>
        </div>
      </section>

      <section className="holder-section">
        <h2>Response</h2>
        <div className="text-holder">
          <p>{savedNote}</p>
        </div>
      </section>

      <footer className="bg-blur">
        <div className="tooltip info">
          ?
          <span className="tooltiptext" style={{ width: 300 }}>
            Allow microphone to use this app. <br />
            {`Settings -> All Apps -> Permission -> Enable Microphone`}
          </span>
        </div>
        {/* <p style={{ marginBottom: 20 }}>Tap the Microphone</p> */}
        <p style={{ marginBottom: 20 }}>
          {isListening ? (
            <>Speak & tap the Microphone...</>
          ) : (
            <>Tap the Microphone...</>
          )}
        </p>
        <button className="mic-btn" onClick={HandleSpeak}>
          {isListening ? (
            <img
              src={Speak}
              style={{ background: `no-repeat center`, height: 90 }}
              alt="speak-icon"
            />
          ) : (
            <img
              src={Mic}
              style={{ background: `no-repeat center` }}
              alt="mic-icon"
            />
          )}
        </button>
      </footer>
    </div>
  );
}

export default App;
