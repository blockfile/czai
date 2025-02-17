import React, { useEffect, useState } from "react";
import bg from "../assets/images/aura-bg.gif";
import COSMO from "../assets/images/talk.2.gif";
import COSMOTALK from "../assets/images/talk.mouthopenclose.gif";

function Main() {
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isTalking, setIsTalking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [invalidCount, setInvalidCount] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);

  // Helper to scramble text
  const scrambleString = (text) => {
    const arr = text.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  // If user enters invalid commands 3 times, scramble the text for 3 seconds
  const animateScramble = () => {
    const originalOutput = terminalOutput.map((line) => ({ ...line }));
    setInputDisabled(true);

    const scrambleInterval = setInterval(() => {
      setTerminalOutput(
        originalOutput.map((line) =>
          // We'll skip images and videos in the scramble
          line.text && line.type !== "image" && line.type !== "video"
            ? { ...line, text: scrambleString(line.text) }
            : line
        )
      );
    }, 100);

    setTimeout(() => {
      clearInterval(scrambleInterval);
      setTerminalOutput(originalOutput);
      setInputDisabled(false);
      setInvalidCount(0);
    }, 3000);
  };

  // 1) On mount, fetch the "Last login" line from your server
  useEffect(() => {
    async function fetchLastLogin() {
      try {
        const response = await fetch("http://localhost:3001/api/lastlogin");
        const data = await response.json();
        setTerminalOutput([{ type: "system", text: data.lastLogin }]);
      } catch (error) {
        setTerminalOutput([
          {
            type: "system",
            text: `Last login: ${new Date().toLocaleString()} (IP unknown)`,
          },
        ]);
      }
    }
    fetchLastLogin();
  }, []);

  // 2) Simulate a boot progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBooting(false);
          displayStartupMessages();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 3) Trigger glitch effect randomly
  useEffect(() => {
    const triggerGlitchRandomly = () => {
      const randomDelay = Math.floor(Math.random() * 5000) + 5000; // 5-10s
      setTimeout(() => {
        setGlitch(true);
        setTimeout(() => {
          setGlitch(false);
          triggerGlitchRandomly();
        }, 500);
      }, randomDelay);
    };
    triggerGlitchRandomly();
  }, []);

  // 4) After boot completes, show startup messages
  const displayStartupMessages = () => {
    const startupMessages = [
      "🟢 Neural Core Initialized...",
      "🟢 Memory Synchronization Complete...",
      "🟢 AI Logic Circuits Engaged...",
      "🟢 Security Protocols Verified...",
      "🟢 Quantum Data Streams Connected...",
      "🟢 Environmental Awareness: ONLINE",
      "🟢 Adaptive Learning Modules: ACTIVE",
      "--------------------------------------------",
      "🔹 SYSTEM STATUS: ✅ ALL CORE FUNCTIONS OPERATIONAL.",
      "🔹 CONNECTION SECURE: 🔒 ENCRYPTION LEVEL: MILITARY-GRADE AES-512",
      "🔹 PROCESSING SPEED: ⚡ QUANTUM THREAD OPTIMIZATION ENABLED",
      "--------------------------------------------",
      "💬 Hello, Operator. I am **CZ-AI**, your **Autonomous AI Assistant.**",
      "🔹 I am ready to execute commands.",
      "🔹 Type 'HELP' for a list of available commands.",
      "📡 System uplink stable. Awaiting input...",
      "/video <prompt> - Generates a short video using CZ-AI.",
      "/gif <prompt> - Generates a GIF based on your prompt.",
      "/generate <prompt> - Generates an image based on your prompt.",
      "/ask <question> - Generates a text/audio response to your question.",
    ];
    const spinnerFrames = ["|", "/", "-", "\\"];
    let messageIndex = 0;

    // A helper to update a "Loading" line
    const updateSpinner = (spinIndex) => {
      setTerminalOutput((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1]?.text?.startsWith("Loading")
        ) {
          const newOutput = [...prev];
          newOutput[newOutput.length - 1] = {
            type: "response",
            text: `Loading ${spinnerFrames[spinIndex % spinnerFrames.length]}`,
          };
          return newOutput;
        } else {
          return [
            ...prev,
            {
              type: "response",
              text: `Loading ${
                spinnerFrames[spinIndex % spinnerFrames.length]
              }`,
            },
          ];
        }
      });
    };

    const showSpinnerAndMessage = () => {
      let spinIndex = 0;
      setTerminalOutput((prev) => {
        if (
          prev.length === 0 ||
          !prev[prev.length - 1]?.text?.startsWith("Loading")
        ) {
          return [
            ...prev,
            {
              type: "response",
              text: `Loading ${
                spinnerFrames[spinIndex % spinnerFrames.length]
              }`,
            },
          ];
        }
        return prev;
      });

      const spinnerInterval = setInterval(() => {
        spinIndex++;
        updateSpinner(spinIndex);
      }, 150);

      setTimeout(() => {
        clearInterval(spinnerInterval);
        setTerminalOutput((prev) => {
          let newOutput = prev;
          if (
            prev.length > 0 &&
            prev[prev.length - 1]?.text?.startsWith("Loading")
          ) {
            newOutput = prev.slice(0, prev.length - 1);
          }
          if (
            newOutput.length === 0 ||
            newOutput[newOutput.length - 1].text !==
              startupMessages[messageIndex]
          ) {
            return [
              ...newOutput,
              { type: "response", text: startupMessages[messageIndex] },
            ];
          }
          return newOutput;
        });
        messageIndex++;
        if (messageIndex < startupMessages.length) {
          setTimeout(showSpinnerAndMessage, 500);
        } else {
          setTimeout(() => setShowInput(true), 500);
        }
      }, 1000);
    };

    showSpinnerAndMessage();
  };

  // This handles text input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // The big command handler: parse the input on Enter
  const handleKeyPress = async (e) => {
    if (inputDisabled) return; // If disabled from invalid commands
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const lowerInput = inputValue.toLowerCase().trim();
      const newCommand = `[CZ-AI:~] USER#$ ${inputValue}`;

      // Add the user command line
      setTerminalOutput((prev) => [
        ...prev,
        { type: "command", text: newCommand },
      ]);

      // 1) HELP command
      if (lowerInput === "help" || lowerInput === "/help") {
        const helpMessages = [
          "Available commands:",
          "  /video <prompt> - Generates a short video using CZ-AI.",
          "       Output: The MP4 video is displayed in the terminal.",
          "  /gif <prompt> - Generates a GIF based on your prompt.",
          "       Output: A GIF is displayed in the terminal.",
          "  /generate <prompt> - Generates an image based on your prompt.",
          "       Output: An image is displayed in the terminal.",
          "  /ask <question> - Generates a text response to your question.",
          "       Output: A text response is displayed and TTS is played.",
          "  help - Displays this help message. (Command is case-insensitive)",
        ];
        helpMessages.forEach((msg, i) => {
          setTimeout(() => {
            setTerminalOutput((prev) => [
              ...prev,
              { type: "response", text: msg },
            ]);
          }, i * 300);
        });
        setInvalidCount(0);
        setInputValue("");
        return;
      }

      // 2) /video command
      else if (lowerInput.startsWith("/video")) {
        setInvalidCount(0);
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: "Please wait, generating video..." },
        ]);
        setIsLoading(true);
        const prompt = inputValue.replace("/video", "").trim();
        try {
          // POST to /api/generateVideo
          const response = await fetch(
            "http://localhost:3001/api/generateVideo",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            }
          );
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          // data.videoDataUrl is "data:video/mp4;base64,<large string>"
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: `Response: Video Generated (${prompt})` },
            { type: "video", text: data.videoDataUrl },
          ]);
        } catch (error) {
          console.error("Error during video generation:", error.message);
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: "Response: Error generating video." },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      // 3) /gif command
      else if (lowerInput.startsWith("/gif")) {
        setInvalidCount(0);
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: "Please wait, generating GIF..." },
        ]);
        setIsLoading(true);
        const prompt = inputValue.replace("/gif", "").trim();
        try {
          const response = await fetch(
            "http://localhost:3001/api/generateGif",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            }
          );
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: `Response: GIF Generated (${prompt})` },
            { type: "image", text: data.gifUrl }, // base64 data URL for the GIF
          ]);
        } catch (error) {
          console.error("Error during GIF generation:", error.message);
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: "Response: Error generating GIF." },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      // 4) /generate command (image)
      else if (lowerInput.startsWith("/generate")) {
        setInvalidCount(0);
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: "Please wait, generating image..." },
        ]);
        setIsLoading(true);
        const prompt = inputValue.replace("/generate", "").trim();
        try {
          const response = await fetch(
            "http://localhost:3001/api/generateImages",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt }),
            }
          );
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data.imageUrl) {
            setTerminalOutput((prev) => [
              ...prev,
              {
                type: "response",
                text: `Response: Image Generated (${prompt})`,
              },
              { type: "image", text: data.imageUrl },
            ]);
          } else {
            throw new Error(
              "Image generation failed, unexpected response format."
            );
          }
        } catch (error) {
          console.error("Error during image generation:", error.message);
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: "Response: Error generating image." },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      // 5) /ask command (text + TTS)
      else if (lowerInput.startsWith("/ask")) {
        setInvalidCount(0);
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: "Please wait, generating response..." },
        ]);
        setIsLoading(true);
        const description = inputValue.replace("/ask", "").trim();
        try {
          const response = await fetch("http://localhost:3001/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: description }),
          });
          if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data.response) {
            setIsTalking(true);
            await processTTS(data.response);
            printWordByWord(data.response);
            setTerminalOutput((prev) => [
              ...prev,
              { type: "response", text: `Nova: ${data.response}` },
            ]);
          } else {
            setTerminalOutput((prev) => [
              ...prev,
              {
                type: "response",
                text: "Response: Failed to generate response.",
              },
            ]);
          }
        } catch (error) {
          console.error("Error during text generation:", error.message);
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: "Response: Error generating response." },
          ]);
        } finally {
          setIsLoading(false);
        }
      }

      // 6) Unknown command
      else {
        setTerminalOutput((prev) => [
          ...prev,
          {
            type: "response",
            text: "Invalid command. Please use help for the known commands.",
          },
        ]);
        const newInvalidCount = invalidCount + 1;
        setInvalidCount(newInvalidCount);
        if (newInvalidCount >= 3) {
          animateScramble();
        }
      }

      setInputValue("");
    }
  };

  // TTS function
  const processTTS = async (text) => {
    try {
      const response = await fetch("http://localhost:3001/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "am_michael" }),
      });
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsTalking(false);
        audio.play();
      } else {
        throw new Error("Failed to fetch TTS audio");
      }
    } catch (error) {
      setTerminalOutput((prev) => [
        ...prev,
        { type: "response", text: "Response: Error generating TTS audio" },
      ]);
      setIsTalking(false);
    }
  };

  // Print a text response word by word
  const printWordByWord = (text) => {
    const words = text.split(" ");
    let index = 0;
    let currentLine = "";
    const interval = setInterval(() => {
      if (index < words.length) {
        currentLine += (index === 0 ? "" : " ") + words[index];
        setTerminalOutput((prev) => [
          ...prev.slice(0, prev.length - 1),
          { type: "response", text: currentLine },
        ]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    setTerminalOutput((prev) => [...prev, { type: "response", text: "" }]);
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center bg-no-repeat relative text-xl"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      {/* COSMO GIF: change src if isTalking */}
      <div className="absolute -top-[700px] left-0 right-0 bottom-24 flex justify-center items-center z-10 mt-6">
        <img
          src={isTalking ? COSMOTALK : COSMO}
          alt="COSMO"
          className="lg:h-[500px] lg:w-[1000px] md:h-[800px] md:w-[800px] h-[600px] w-[600px]"
        />
      </div>

      {/* Terminal Container */}
      <div className="relative z-10 flex items-center justify-center h-full  ">
        <div
          className={`terminal-container font-mono3 ${glitch ? "glitch" : ""}`}
          style={{
            position: "absolute",
            bottom: "6%", // instead of top: "10%"
            left: "10%",
            width: "80%",
            height: "60%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            fontFamily: "monospace",
            fontSize: "1.2rem",
            boxShadow: "0 5px 50px rgba(255, 255, 255, 0.8)",
            borderRadius: "10px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Terminal Header */}
          <div className="bg-white text-amber-500 px-4 py-2 rounded-t-lg font-bold flex justify-between items-center silkscreen-regular text-2xl">
            <span>CZAI — CONSOLE</span>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Terminal Output Window */}
          <div
            className="flex-grow overflow-y-auto font-mono text-xl px-4 py-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4CAF50 #000",
            }}
          >
            {/* If still booting, show boot progress bar */}
            {booting && (
              <p style={{ color: "white" }}>
                BOOTING SYSTEM... [
                {Array(Math.floor(progress / 4))
                  .fill("█")
                  .join("")}
                {Array(25 - Math.floor(progress / 4))
                  .fill(" ")
                  .join("")}
                ] {progress}%
              </p>
            )}
            {/* Map over terminalOutput lines */}
            {terminalOutput.map((line, index) => {
              // if it's an 'image', show as <img>
              if (line.type === "image") {
                return (
                  <img
                    key={index}
                    src={line.text}
                    alt="Generated"
                    className="rounded-lg shadow-lg mt-2 cursor-pointer"
                    style={{ maxWidth: "350px" }}
                    onClick={() => setEnlargedImage(line.text)}
                  />
                );
              }
              // if it's a 'video', embed as <video controls src="data:video/mp4;base64,...">
              else if (line.type === "video") {
                return (
                  <video
                    key={index}
                    controls
                    src={line.text}
                    className="rounded-lg shadow-lg mt-2 cursor-pointer"
                    style={{ maxWidth: "350px" }}
                  />
                );
              }
              // otherwise it's text of some kind
              else {
                return (
                  <div
                    key={index}
                    className={`flex justify-start silkscreen-regular text-justify ${
                      line.type === "response" ? "text-yellow-300" : "white"
                    }`}
                  >
                    <div>{line.text}</div>
                  </div>
                );
              }
            })}
          </div>

          {/* Terminal Input */}
          {showInput && !booting && (
            <div className="bg-white px-4 py-2 border-t border-gray-700">
              <input
                type="text"
                disabled={inputDisabled}
                className="w-full bg-black bg-opacity-45 text-amber-500 silkscreen-regular text-xl px-4 py-2 focus:outline-none"
                placeholder="Type a command..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
            </div>
          )}
        </div>
      </div>

      {/* Enlarge an image/video if clicked */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="Enlarged"
            className="max-w-full max-h-full"
          />
        </div>
      )}

      {/* Glitch CSS */}
      <style>{`
        @keyframes glitch {
          0% { 
            transform: translate(2px, -2px); 
            color: #ff0000;
            box-shadow: 0 5px 30px rgba(255, 0, 0, 0.7);
          }
          25% { 
            transform: translate(-2px, 2px); 
            color: #00ff00;
            box-shadow: 0 -5px 30px rgba(0, 255, 0, 0.7);
          }
          50% { 
            transform: translate(2px, 0px); 
            color: #0000ff;
            box-shadow: -5px 5px 30px rgba(0, 0, 255, 0.7);
          }
          75% { 
            transform: translate(-2px, -2px); 
            color: #ff00ff;
            box-shadow: 5px -5px 30px rgba(255, 0, 255, 0.7);
          }
          100% { 
            transform: translate(0px, 0px); 
            color: limegreen;
            box-shadow: 0 5px 30px rgba(0, 255, 0, 0.5);
          }
        }
        .glitch {
          animation: glitch 0.2s infinite;
          filter: blur(0.8px) brightness(1.2);
          position: relative;
        }
        .glitch::before,
        .glitch::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.8;
        }
        .glitch::before {
          color: #ff0000;
          transform: translate(-2px, 2px);
        }
        .glitch::after {
          color: #00ffff;
          transform: translate(2px, -2px);
        }
      `}</style>
    </div>
  );
}

export default Main;
