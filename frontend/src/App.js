import React, { useState, useEffect } from "react";
import "./App.css";

import { useSpeechSynthesis } from "react-speech-kit";
import env from "react-dotenv";

import Mic from "./asset/micBtn.svg";
import Speak from "./asset/speak.jpg";
import { ResultReason,SpeechSynthesizer } from "microsoft-cognitiveservices-speech-sdk";

const sdk = require("microsoft-cognitiveservices-speech-sdk");
const BASE_URL = "http://localhost:8080";

// const SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;

// const SpeechGrammarList = window.webkitSpeechGrammarList;
// console.log(env.SPEECH_KEY)
// const mic = new SpeechRecognition();
// const speechRecognitionList = new SpeechGrammarList()
// mic.continuous = false;
// mic.interimResults = true;
// mic.grammars=speechRecognitionList
// mic.maxAlternatives=1

function App() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const { speak, cancel } = useSpeechSynthesis();
  useEffect(() => {
    // Update the document title using the browser API
    cancel();
  });

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    env.SPEECH_KEY,
    env.SPEECH_REGION
  );
  speechConfig.speechRecognitionLanguage = "bn-IN";
  speechConfig.speechSynthesisVoiceName = "bn-IN-TanishaaNeural";

  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  const audioConfigSpeaker = sdk.AudioConfig.fromDefaultSpeakerOutput();
  const speechSynthesizer = new SpeechSynthesizer(
    speechConfig,
    audioConfigSpeaker
  );


  //   const handleListen = async (listenStatus) => {
  //     if(listenStatus){
  //       setNote("");
  //       cancel()
  //       setSavedNote("Listening to your input...")
  // const speechConfig = sdk.SpeechConfig.fromSubscription(env.SPEECH_KEY,env.SPEECH_REGION);
  // let audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  // let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  // speechConfig.speechRecognitionLanguage = "bn-IN";

  //     speechRecognizer.recognizeOnceAsync(result => {
  //       switch (result.reason) {
  //           case sdk.ResultReason.RecognizedSpeech:
  //               console.log(`RECOGNIZED: Text=${result.text}`);

  //               setNote(result.text)
  //               break;
  //           case sdk.ResultReason.NoMatch:
  //               console.log("NOMATCH: Speech could not be recognized.");
  //               break;
  //           case sdk.ResultReason.Canceled:
  //               const cancellation = sdk.CancellationDetails.fromResult(result);
  //               console.log(`CANCELED: Reason=${cancellation.reason}`);

  //               if (cancellation.reason == sdk.CancellationReason.Error) {
  //                   console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
  //                   console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
  //                   console.log("CANCELED: Did you set the speech resource key and region values?");
  //               }
  //               break;
  //       }
  //       speechRecognizer.close();
  //     })

  //   }
  //   else{
  //     await handleSaveNote()
  //   }

  //     // if (listenStatus) {
  //     //   setNote("");
  //     //   mic.start();
  //     //   mic.onend = () => {
  //     //     mic.start();
  //     //   };
  //     //   setSavedNote("Listening to your input...");
  //     //   cancel();
  //     // } else {
  //     //   mic.stop();
  //     //   mic.onend = () => {};
  //     //   await handleSaveNote();
  //     // }

  //     // mic.onstart = () => {};
  //     // mic.onresult = (event) => {
  //     //   const transcript = Array.from(event.results)
  //     //     .map((result) => result[0])
  //     //     .map((result) => result.transcript)
  //     //     .join("");
  //     //   setNote(transcript);
  //     //   mic.onerror = (event) => {
  //     //     console.log(event.error);
  //     //     setNote("");
  //     //   };
  //     // };
  //   };

  async function askQuestion(prompt) {
    console.log("Question asked.");
    const response = await fetch(BASE_URL + "/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    }).catch((err) => console.log(err));
    if (response?.ok) {
      const data = await response.json();
      const parsedData = data.result;
      return parsedData;
    } else return "I am sorry, could you say that again please";
  }

  const handleSaveNote = async (displayText) => {
    // Call OpenAI Apis using note
    setSavedNote("Processing your input...");
    // setNote(displayText)
    // console.log("Note-2: "+displayText)

    let res = await askQuestion(displayText);
    setSavedNote(res.split("\n").map((str) => <p>{str}</p>));
    speaker(res)
  };

  const HandleSpeak = () => {
    setIsListening(!isListening);
    startFromMic(!isListening);
  };

  async function speaker(output){
    speechSynthesizer.speakTextAsync(
      output,
      (result) => {
        if (result) {
          speechSynthesizer.close();
          console.log(result.audioData)
          return result.audioData;
        }
      },
      (error) => {
        console.log(error);
        speechSynthesizer.close();
      }
    );
  }

  async function startFromMic(isListening) {
    if (isListening) {
      // Recognize speech and convert to text.
      setSavedNote("Listening..");

      recognizer.recognizeOnceAsync(async (result) => {
        let displayText;
        if (result.reason === ResultReason.RecognizedSpeech) {
          displayText = `${result.text}`;
        } else {
          displayText =
            "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
        }
        setNote(displayText);
        console.log(displayText);
        await handleSaveNote(displayText);

        // this.setState({
        //     displayText: displayText
        // });
      });

      // Convert text to speech : https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=tts

    } else {
      await handleSaveNote();
    }
  }

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
