const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Replicate = require("replicate");
const app = express();
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const PORT = 3001;
require("dotenv").config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

// CORS Configuration
const corsOptions = {
  origin: ["https://app.czai.tech", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// Apply CORS to all routes
app.use(cors(corsOptions));

app.use(bodyParser.json());

// API Route for Generating Chat Response
// API Route for Generating Chat Response
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    // Option 1: Using prompt engineering for conciseness
    const promptWithInstruction = `${prompt}\n\nPlease answer concisely.`;
    const output = await replicate.run("deepseek-ai/deepseek-r1", {
      input: { prompt: promptWithInstruction },
      // Option 2: Uncomment the next line if the model supports max_length
      // input: { prompt: promptWithInstruction, max_length: 50 },
    });

    // Ensure output is a string
    const responseText = Array.isArray(output)
      ? output.join(" ")
      : String(output);

    // Remove the entire <think>...</think> block
    const cleanedResponse = responseText
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();

    res.json({ response: cleanedResponse });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// API Route for Generating Images
app.post("/api/generateImages", async (req, res) => {
  const { prompt } = req.body;

  try {
    console.log("Request Body:", req.body);

    const prediction = await replicate.run(
      "black-forest-labs/flux-1.1-pro-ultra",
      {
        input: {
          prompt: prompt || "default prompt",
          aspect_ratio: "3:2",
        },
      }
    );

    console.log("Replicate Prediction:", prediction);

    if (prediction instanceof ReadableStream) {
      const reader = prediction.getReader();
      let chunks = [];

      // Read the stream and convert it to a buffer
      const processStream = async () => {
        const { value, done } = await reader.read();
        if (done) {
          const buffer = Buffer.concat(chunks);
          const base64Image = buffer.toString("base64");
          res.status(200).json({
            imageUrl: `data:image/jpeg;base64,${base64Image}`,
          });
        } else {
          chunks.push(value);
          processStream();
        }
      };

      await processStream();
    } else if (typeof prediction === "string") {
      res.status(200).json({ imageUrl: prediction });
    } else if (prediction && prediction.output) {
      res.status(200).json({ imageUrl: prediction.output[0] });
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

const audioDir = path.join(__dirname, "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

// API Route for TTS
app.post("/api/tts", async (req, res) => {
  let { text, voice } = req.body;

  // If text is an array, join its elements into a string
  if (Array.isArray(text)) {
    text = text.join(" ");
  }

  console.log("TTS Request Received:", { text, voice });

  try {
    const prediction = await replicate.run(
      "jaaari/kokoro-82m:f559560eb822dc509045f3921a1921234918b91739db4bf3daab2169b71c7a13",
      {
        input: {
          text: text, // now ensured to be a string
          voice: voice || "am_michael",
          speed: 1.1,
        },
      }
    );

    console.log("Prediction Response:", prediction);

    if (prediction instanceof ReadableStream) {
      console.log("Streaming audio directly...");
      res.setHeader("Content-Type", "audio/wav");

      // Stream the audio data to the client
      const reader = prediction.getReader();
      let result;
      while (!(result = await reader.read()).done) {
        res.write(Buffer.from(result.value));
      }
      res.end();
    } else if (prediction && prediction.output) {
      const audioUrl = prediction.output; // If the API provides a direct URL
      res.status(200).json({ audioUrl });
    } else {
      throw new Error("Unexpected response format from prediction.");
    }
  } catch (error) {
    console.error("Error generating TTS:", error.message);
    res.status(500).json({ error: "Failed to generate TTS audio." });
  }
});

app.post("/api/generateGif", async (req, res) => {
  const { prompt } = req.body;
  try {
    console.log("GIF Request Received:", req.body);
    const prediction = await replicate.run(
      "lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a",
      {
        input: {
          mp4: false,
          seed: 6226,
          steps: 30,
          width: 672,
          height: 384,
          prompt: prompt,
          scheduler: "EulerAncestralDiscreteScheduler",
          negative_prompt: "blurry",
        },
        onProgress: (log) => {
          console.log("GIF generation progress:", log);
        },
      }
    );
    console.log("GIF Prediction:", prediction);

    // Fetch the generated GIF using the URL in 'prediction'
    const gifResponse = await fetch(prediction);
    // Use arrayBuffer() instead of buffer()
    const arrayBuffer = await gifResponse.arrayBuffer();
    // Convert the array buffer to a Node Buffer
    const buffer = Buffer.from(arrayBuffer);
    const base64Gif = buffer.toString("base64");
    // Return the GIF as a data URL
    res.status(200).json({ gifUrl: `data:image/gif;base64,${base64Gif}` });
  } catch (error) {
    console.error("Error generating GIF:", error.message);
    res.status(500).json({ error: "Failed to generate GIF" });
  }
});

app.get("/api/lastlogin", async (req, res) => {
  try {
    // Fetch public IP from ipify
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // Fetch location data for the IP from ip-api.com
    const locResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const locData = await locResponse.json();

    const now = new Date();
    const timeString = now.toLocaleString(); // e.g., "8/14/2025, 8:55:40 AM"

    let locationStr = "";
    if (locData.status === "success") {
      // You can customize which fields you want to display.
      locationStr = `${locData.city}, ${locData.regionName}, ${locData.country}`;
    } else {
      locationStr = "Location Unknown";
    }

    res.json({
      lastLogin: `Last login: ${timeString} from IP: ${ip} (${locationStr})`,
    });
  } catch (error) {
    console.error("Error fetching IP/location:", error);
    const now = new Date();
    res.json({
      lastLogin: `Last login: ${now.toLocaleString()} (IP/Location unknown)`,
    });
  }
});

app.post("/api/generateVideo", async (req, res) => {
  const { prompt } = req.body;
  try {
    console.log("VIDEO Request Received:", req.body);

    // 1) Run the luma/ray replicate model
    const output = await replicate.run("luma/ray", {
      input: {
        loop: false,
        prompt: prompt, // user prompt
        aspect_ratio: "16:9",
      },
      onProgress: (log) => {
        console.log("VIDEO generation progress:", log);
      },
    });

    console.log("VIDEO Prediction output:", output);
    // The result is typically an array or string containing the MP4 URL
    const mp4Url = Array.isArray(output) ? output[0] : output;

    // 2) Fetch the MP4 file from the replicate URL
    const response = await fetch(mp4Url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) Convert to base64
    const base64Video = buffer.toString("base64");

    // 4) Create a data URL so the client can embed the video directly
    const videoDataUrl = `data:video/mp4;base64,${base64Video}`;

    // 5) Return it to the client
    res.status(200).json({ videoDataUrl });
  } catch (error) {
    console.error("Error generating video:", error.message);
    res.status(500).json({ error: "Failed to generate video" });
  }
});

// Serve static files for audio
app.use("/audio", express.static(audioDir));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
