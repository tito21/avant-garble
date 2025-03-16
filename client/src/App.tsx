import { ReactElement, useState, useRef, useEffect } from 'react'
import useWebSocket from "react-use-websocket"

import Footer from './Footer'
import ChatBubble from './ChatBubble'
// import ChatBubbleResponse from './ChatBubbleResponse'
import ChatErrorBubble from './ChatErrorBubble'
import InputBox from './InputBox'

import './App.css'

const order = 3;



function App() {

  const bubblesArray: ReactElement[] = [];
  const [bubblesState, setStatesBubble] = useState(bubblesArray);
  const [responseNumberState, setStatesResponseNumber] = useState(0);
  const [responseState, setStatesResponse] = useState("");
  let currentResponseBubble: ReactElement;
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom();
  }, [bubblesState]);


  const inputBox = InputBox((value) => {
    // console.log(value);
    let currentNgram = value.slice(value.length - order, value.length);
    if (currentNgram.length < order) {
      currentNgram += " ".repeat(order - currentNgram.length);
    }
    setStatesResponse("");
    // let url = `get-text?currentGram=${currentNgram}`;
    setStatesBubble(prevStateArray => [...prevStateArray, <ChatBubble text={value} direction='right' id={responseNumberState} finished={false}></ChatBubble>]);
    setStatesResponseNumber(responseNumberState + 1);

    sendMessage(currentNgram);

    // fetch(url).then(response => response.json()).then(data => {
    //   console.log("Response", data);
    // currentResponseBubble = ChatBubbleResponse({text: "", id: responseNumberState});
    currentResponseBubble = <ChatBubble text={responseState} direction='left' id={responseNumberState} finished={false}></ChatBubble>
    setStatesBubble(prevStateArray => [...prevStateArray, currentResponseBubble]);
    setStatesResponseNumber(responseNumberState + 1);
    // }).catch(error => {
    //   console.error("Error", error);
    //   setStatesBubble(prevStateArray => [...prevStateArray, ChatErrorBubble('Error getting response')]);
    // });
  });


  const url = new URL('/get-text', window.location.href);
  url.protocol = url.protocol.replace('http', 'ws');
  const wsUrl = url.href // => ws://www.example.com:9999/path/to/websocket

  const {
    sendMessage,
  } = useWebSocket(wsUrl, {
    shouldReconnect: () => true,
    onMessage: (event) => {
      // console.log("Message", event.data);
      if (event.data === "Done1234") {
        let fullText = `${responseState}`;
        setStatesBubble(prevStateArray => {
          prevStateArray[prevStateArray.length - 1] = <ChatBubble text={fullText} direction='left' id={responseNumberState} finished={true}></ChatBubble>;
          return [...prevStateArray];
        });
        setStatesResponse("");
        return;
      }
      // console.log("text", responseState);
      setStatesResponse(text => text + event.data);
      let fullText = `${responseState}`;
      setStatesBubble(prevStateArray => {
        prevStateArray[prevStateArray.length - 1] = <ChatBubble text={fullText} direction='left' id={responseNumberState} finished={false}></ChatBubble>;
        return [...prevStateArray];
      });
    },
    onError: (event) => {
      console.error("Error", event);
      setStatesBubble(prevStateArray => [...prevStateArray, <ChatErrorBubble text='Error getting response'></ChatErrorBubble>]);
      setStatesResponse("");
    },
    onClose: (event) => {
      console.log("Close", event);
      setStatesResponse(text => text);
      let fullText = `${responseState}`;
      setStatesBubble(prevStateArray => {
        prevStateArray[prevStateArray.length - 1] = <ChatBubble text={fullText} direction='left' id={responseNumberState} finished={false}></ChatBubble>;
        return [...prevStateArray];
      });

    },
  });


  return (
    <>
      <header>
        <img src="logo.svg" alt="Avant Garble Logo" />
        <h1>Avant Garble</h1>
      </header>
      <main>
        <div className="chat-container">
          {bubblesState}
        <div ref={chatEndRef}/>
        </div>
        {inputBox}
      </main>
      <Footer></Footer>
    </>
  )
}

export default App
