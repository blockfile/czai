import React, { useEffect, useState, useRef } from "react";
import bgVideo from "../assets/images/aura-bg.mp4";
import COSMO from "../assets/images/talk.2.gif";
import COSMOTALK from "../assets/images/talk.mouthopenclose.gif";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

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
  const [uptime, setUptime] = useState("0h 0m");
  const startTime = useRef(Date.now());
  // New state for random logs (terminal-like logs)
  const [logLines, setLogLines] = useState([]);

  const outputRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime.current;
      const totalMinutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setUptime(`${hours}h ${minutes}m`);
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Memory, Swap, and Temps (random updates every 5 seconds)
  const [memoryUsage, setMemoryUsage] = useState("73% used");
  const [swapUsage, setSwapUsage] = useState("1% used");
  const [temps, setTemps] = useState("CPU 45°C");
  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsage(`${Math.floor(Math.random() * 30) + 60}% used`);
      setSwapUsage(`${Math.floor(Math.random() * 5) + 1}% used`);
      setTemps(`CPU ${Math.floor(Math.random() * 20) + 40}°C`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  // Preload talking GIF
  useEffect(() => {
    const preloadTalkingGif = new Image();
    preloadTalkingGif.src = COSMOTALK;
  }, []);

  // Auto-scroll whenever terminalOutput changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Helper: scramble text
  const scrambleString = (text) => {
    const arr = text.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  };

  // Animate scramble if user enters invalid commands too often
  const animateScramble = () => {
    const originalOutput = terminalOutput.map((line) => ({ ...line }));
    setInputDisabled(true);

    const scrambleInterval = setInterval(() => {
      setTerminalOutput(
        originalOutput.map((line) =>
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

  // 1) Fetch "Last login" line
  useEffect(() => {
    async function fetchLastLogin() {
      try {
        const response = await fetch("https://app.czai.tech/api/lastlogin");
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

  // 2) Boot progress simulation
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

  // 3) Random glitch effect
  useEffect(() => {
    const triggerGlitchRandomly = () => {
      const randomDelay = Math.floor(Math.random() * 5000) + 5000;
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

  // 4) Show startup messages
  const displayStartupMessages = () => {
    const startupMessages = [
      "  Neural Core Initialized...",
      "  Memory Synchronization Complete...",
      "  AI Logic Circuits Engaged...",
      "  Security Protocols Verified...",
      "  Quantum Data Streams Connected...",
      "  Environmental Awareness: ONLINE",
      "  Adaptive Learning Modules: ACTIVE",
      "--------------------------------------------",
      "🔹 SYSTEM STATUS: ✅ ALL CORE FUNCTIONS OPERATIONAL.",
      "🔹 CONNECTION SECURE: 🔒 ENCRYPTION LEVEL: MILITARY-GRADE AES-512",
      "🔹 PROCESSING SPEED: ⚡ QUANTUM THREAD OPTIMIZATION ENABLED",
      "--------------------------------------------",
      "💬 Hello, Operator. I am **AI-16CZ**, your **Autonomous AI Assistant.**",
      "🔹 I am ready to execute commands.",
      "🔹 Type 'HELP' for a list of available commands.",
      "📡 System uplink stable. Awaiting input...",
      "/video <prompt> - Generates a short video using AI-16CZ.",
      "/gif <prompt> - Generates a GIF based on your prompt.",
      "/generate <prompt> - Generates an image based on your prompt.",
      "/ask <question> - Generates a text/audio response to your question.",
    ];
    const spinnerFrames = ["|", "/", "-", "\\"];
    let messageIndex = 0;

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

  // New useEffect to continuously add random log lines in the left container
  useEffect(() => {
    const logInterval = setInterval(() => {
      // Example code-like lines
      const codeSamples = [
        "struct group_info init_groups = { .usage = ATOMIC_INIT(2) };",
        "struct group_info *group_alloc(int gidsetsize) {",
        "    nbblocks = (gidsetsize + NGROUPS_PER_BLOCK - 1) / NGROUPS_PER_BLOCK;",
        "    group_info = kmalloc(sizeof(*group_info) + nbblocks*sizeof(gid_t *), GFP_USER);",
        "    if (!group_info) goto out;",
        "    group_info->ngroups = gidsetsize;",
        "    group_info->nblocks = nbblocks;",
        "    if (gidsetsize <= NGROUPS_SMALL) {",
        "        group_info->blocks[0] = group_info->small_block;",
        "    } else {",
        "        for (i = 0; i < nbblocks; i++) {",
        "            group_info->blocks[i] = (gid_t *)__get_free_page(GFP_USER);",
        "        }",
        "    }",
        "    return group_info;",
        "out: return NULL;",
        "}",
      ];
      const randomLine =
        codeSamples[Math.floor(Math.random() * codeSamples.length)];
      setLogLines((prev) => [...prev, randomLine]);
    }, 1000);
    return () => clearInterval(logInterval);
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle input "Enter"
  const handleKeyPress = async (e) => {
    if (inputDisabled) return;
    if (e.key === "Enter" && inputValue.trim() !== "") {
      if (isLoading) return;
      processCommand(inputValue);
    }
  };

  // Unified command processor
  const processCommand = async (input) => {
    const lowerInput = input.toLowerCase().trim();
    const newCommand = `[AI-16CZ:~] USER#$ ${input}`;

    // Show user command
    setTerminalOutput((prev) => [
      ...prev,
      { type: "command", text: newCommand },
    ]);

    // Check commands
    if (lowerInput === "help" || lowerInput === "/help") {
      const helpMessages = [
        "Available commands:",
        "  /video <prompt> - Generates a short video using AI-16CZ.",
        "  /gif <prompt> - Generates a GIF based on your prompt.",
        "  /generate <prompt> - Generates an image based on your prompt.",
        "  /ask <question> - Generates a text response + TTS audio.",
        "  help - Displays this help message.",
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
    } else if (lowerInput.startsWith("/video")) {
      // /video command
      setInvalidCount(0);
      setIsLoading(true);
      setTerminalOutput((prev) => [
        ...prev,
        { type: "response", text: "Please wait, generating video..." },
      ]);
      const prompt = input.replace("/video", "").trim();
      try {
        const response = await fetch(
          "https://app.czai.tech/api/generateVideo",
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
    } else if (lowerInput.startsWith("/gif")) {
      // /gif command
      setInvalidCount(0);
      setIsLoading(true);
      setTerminalOutput((prev) => [
        ...prev,
        { type: "response", text: "Please wait, generating GIF..." },
      ]);
      const prompt = input.replace("/gif", "").trim();
      try {
        const response = await fetch("https://app.czai.tech/api/generateGif", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: `Response: GIF Generated (${prompt})` },
          { type: "image", text: data.gifUrl },
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
    } else if (lowerInput.startsWith("/generate")) {
      // /generate command (image)
      setInvalidCount(0);
      setIsLoading(true);
      setTerminalOutput((prev) => [
        ...prev,
        { type: "response", text: "Please wait, generating image..." },
      ]);
      const prompt = input.replace("/generate", "").trim();
      try {
        const response = await fetch(
          "https://app.czai.tech/api/generateImages",
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
    } else if (lowerInput.startsWith("/ask")) {
      // /ask command
      setInvalidCount(0);
      setIsLoading(true);
      setTerminalOutput((prev) => [
        ...prev,
        { type: "response", text: "Please wait, generating response..." },
      ]);
      const description = input.replace("/ask", "").trim();
      try {
        const response = await fetch("https://app.czai.tech/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: description }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.response) {
          await processTTS(data.response);
          printWordByWord(data.response);
          setTerminalOutput((prev) => [
            ...prev,
            { type: "response", text: `CZAI: ${data.response}` },
          ]);
        } else {
          setTerminalOutput((prev) => [
            ...prev,
            {
              type: "response",
              text: "Response: Failed to generate response.",
            },
          ]);
          setIsTalking(false);
        }
      } catch (error) {
        console.error("Error during text generation:", error.message);
        setTerminalOutput((prev) => [
          ...prev,
          { type: "response", text: "Response: Error generating response." },
        ]);
        setIsTalking(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Unknown command
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
  };

  // TTS function
  const processTTS = async (text) => {
    try {
      setIsTalking(true);
      const response = await fetch("https://app.czai.tech/api/tts", {
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

  // Print text word by word
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

  // Additional state declarations
  const [networkStatus, setNetworkStatus] = useState({
    eth: "192.168.0.10",
    upload: "120KB/s",
    download: "1.2MB/s",
  });
  const [uptimeStart] = useState(Date.now());
  const [worldUptime, setWorldUptime] = useState("0 days 0 hrs 0 mins");

  // Simulate network status updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkStatus({
        eth: "192.168.0.10",
        upload: `${Math.floor(Math.random() * 50) + 100}KB/s`,
        download: `${(Math.random() * 1.5 + 1).toFixed(1)}MB/s`,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update world uptime every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - uptimeStart;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setWorldUptime(`${days} days ${hours} hrs ${minutes} mins`);
    }, 60000);
    return () => clearInterval(interval);
  }, [uptimeStart]);

  return (
    <div className="overflow-x-hidden custom-scrollbar w-screen h-screen font-mono text-sm bg-black text-yellow-300">
      {/* Background Video (disabled for clarity) */}
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={bgVideo} type="video/mp4" />
      </video> */}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-80"></div>

      {/* MAIN WRAPPER */}
      <div className="relative z-10 w-full h-full flex flex-col p-4">
        {/* TOP BAR with clock, CPU usage, memory, etc. */}
        <div className="flex justify-between items-center mb-2">
          {/* Left block: Time/Date */}
          <div className="flex flex-col space-y-1">
            <div className="text-2xl" id="clock">
              {new Date().toLocaleTimeString()}
            </div>
            <div className="text-xs opacity-80">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Some system info placeholders */}
          <div className="flex items-center space-x-6 text-xs play-regular">
            <div className="flex flex-col items-end">
              <div>UPTIME: {uptime}</div>
              <div>CPU: i7-8650U</div>
              <div>LINUX KERNEL: 5.19</div>
            </div>
            <div className="flex flex-col items-end">
              <div>Memory: {memoryUsage}</div>
              <div>Swap: {swapUsage}</div>
              <div>Temps: {temps}</div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="flex-grow flex flex-col md:flex-row">
          {/* LEFT COLUMN */}
          <div className="w-full md:w-1/3 p-2 space-y-2 flex flex-col">
            {/* Cosmo Image (always visible) */}
            <div className="bg-black bg-opacity-40 p-2 h-[600px] flex items-center justify-center">
              <img
                src={isTalking ? COSMOTALK : COSMO}
                alt="COSMO"
                className="max-h-full max-w-full"
              />
            </div>
            {/* Additional info: Only show on md and above */}
            <div className="hidden md:flex md:flex-col md:space-y-2">
              {/* Network Status */}
              <div className="bg-black bg-opacity-40 p-2 play-regular">
                <div className="font-bold text-yellow-400 mb-1">
                  NETWORK STATUS
                </div>
                <div className="text-xs">ETH0: {networkStatus.eth}</div>
                <div className="text-xs">Upload: {networkStatus.upload}</div>
                <div className="text-xs">
                  Download: {networkStatus.download}
                </div>
              </div>
              {/* World Uptime & Code Logs */}
              <div className="bg-black bg-opacity-40 p-2 play-regular">
                <div className="font-bold text-yellow-400 mb-1">
                  WORLD UPTIME
                </div>
                <div className="text-xs mb-2">{worldUptime}</div>
                {/* Terminal-like log container with code-like lines */}
                <div className="bg-transparent border border-yellow-500 rounded shadow-lg">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between px-2 py-1 border-b border-yellow-500 bg-purple-800">
                    <span className="text-xs font-bold text-yellow-400">
                      [CODE LOGS]
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  {/* Scrollable log window */}
                  <div className="h-56 bg-transparent p-2 overflow-y-auto custom-scrollbar">
                    {logLines.map((log, idx) => (
                      <div key={idx} className="text-xs text-white">
                        {log}
                      </div>
                    ))}
                  </div>
                  {/* Disabled input */}
                  <div className="border-t border-yellow-500 px-2 py-1">
                    <input
                      disabled
                      className="w-full bg-transparent text-white text-xs focus:outline-none"
                      placeholder="~ input disabled ~"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: The "Terminal" area */}
          <div className="w-[330px] md:w-2/3 flex flex-col bg-black bg-opacity-40 sm:h-[600px] md:h-[1040px] mt-2 mx-5 play-regular ">
            {/* Terminal header (optional) */}
            <div
              className={`px-4 py-2 border bg-purple-800 border-yellow-500 flex justify-between items-center ${
                glitch ? "glitch" : ""
              }`}
            >
              <span className="text-yellow-400 font-bold text-lg play-regular">
                [ai-16cz:~] Terminal
              </span>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Terminal output */}
            <div
              ref={outputRef}
              className="flex-grow overflow-y-auto p-3 border text-xs md:text-sm font-mono border-yellow-500 custom-scrollbar"
            >
              {/* If still booting, show progress */}
              {booting && (
                <p className="text-yellow-300 play-regular">
                  BOOTING SYSTEM... {progress}%
                </p>
              )}
              {terminalOutput.map((line, index) => {
                if (line.type === "image") {
                  return (
                    <div key={index} className="my-2">
                      <img
                        src={line.text}
                        alt="Generated"
                        className="inline-block max-w-xs rounded shadow cursor-pointer"
                        onClick={() => setEnlargedImage(line.text)}
                      />
                    </div>
                  );
                } else if (line.type === "video") {
                  return (
                    <div key={index} className="my-2">
                      <video
                        controls
                        src={line.text}
                        className="inline-block max-w-xs rounded shadow cursor-pointer"
                      />
                    </div>
                  );
                } else {
                  const textColor =
                    line.type === "command"
                      ? "text-yellow-300 geo-regular text-xl uppercase"
                      : line.type === "response"
                      ? "text-purple-500 geo-regular text-xl uppercase"
                      : "text-yellow-100 geo-regular text-xl uppercase";
                  return (
                    <div
                      key={index}
                      className={`whitespace-pre-wrap ${textColor}`}
                    >
                      {line.text}
                    </div>
                  );
                }
              })}
            </div>

            {/* Terminal input */}
            {showInput && !booting && (
              <div className="border border-yellow-500 px-3 py-2">
                <input
                  type="text"
                  className="w-full bg-black bg-opacity-60 text-yellow-300 focus:outline-none px-2 py-1"
                  placeholder="Type a command..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  disabled={inputDisabled || isLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ICONS + KEYBOARD (just placeholders) */}
        <div className="mt-2 bg-black bg-opacity-40 p-2 flex flex-col space-y-2">
          <div className="flex space-x-4 justify-center text-xs">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              <FaXTwitter size={28} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              <FaTelegramPlane size={28} />
            </a>
          </div>
        </div>
      </div>

      {/* Enlarged image modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
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
        /* Scrollbar style */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: purple; /* changed to purple */
          border-radius: 9999px;
        }

        @keyframes glitch {
          0% { transform: translate(2px, -2px); color: #ffdc00; text-shadow: 0 0 5px #ffdc00; }
          25% { transform: translate(-2px, 2px); color: #ffffff; text-shadow: 0 0 5px #ffffff; }
          50% { transform: translate(2px, 0px); color: #ffdc00; text-shadow: 0 0 5px #ffdc00; }
          75% { transform: translate(-2px, -2px); color: #ffffff; text-shadow: 0 0 5px #ffffff; }
          100% { transform: translate(0px, 0px); color: #ffdc00; text-shadow: 0 0 5px #ffdc00; }
        }
        .glitch {
          animation: glitch 0.4s infinite;
        }
      `}</style>
    </div>
  );
}

export default Main;
