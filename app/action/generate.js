"use server";

import Replicate from "replicate";
import fs from "node:fs";
import OpenAI from "openai";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// OpenRouter client for image analysis
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function analyzeCollage(imageDataUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this enhanced image and suggest 3 specific improvements. Focus on composition, lighting, colors, and overall polish. Format your response as a JSON array of exactly 3 strings, like: ["enhance the lighting to make it more dramatic", "adjust the color balance for warmer tones", "add more depth to the background"]',
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;

    // Parse the JSON response
    try {
      const suggestions = JSON.parse(content);
      if (Array.isArray(suggestions) && suggestions.length === 3) {
        return suggestions;
      } else {
        throw new Error("Invalid suggestions format");
      }
    } catch (parseError) {
      // Fallback: extract suggestions from text if JSON parsing fails
      console.warn("JSON parsing failed, using fallback extraction");
      const fallbackSuggestions = [
        "Enhance the lighting for better depth and contrast",
        "Adjust color balance for more vibrant and professional look",
        "Improve composition by refining the overall layout",
      ];
      return fallbackSuggestions;
    }
  } catch (error) {
    console.error("Error analyzing collage:", error);
    // Return default suggestions if API fails
    return [
      "Enhance the lighting for better depth and contrast",
      "Adjust color balance for more vibrant and professional look",
      "Improve composition by refining the overall layout",
    ];
  }
}

export async function predictUserIntent(canvasImageUrl, individualImages = [], prompt = "") {
  try {
    // Build content array with canvas image and individual images
    const messageContent = [
      {
        type: "text",
        text: `Analyze this user-created collage and predict specific transformations they want to perform. 

You can see:
1. The final collage image (how the user arranged everything)
2. Individual source images that were used to create the collage

Focus on actionable changes like:
- How should objects interact with each other? (e.g., "put the phone in her hand", "make the cat sit on the chair", "put the coca cole in her hand")
- Where should elements be positioned? (e.g., "move the car to the road", "place the flower in the vase")
- How should objects fit into the scene? (e.g., "make the person stand on the ground", "put the book on the table")
- What effects should be applied? (e.g., "add shadows under objects", "make the background blurry")

Also keep the reponse short and concise, simple and to the point.
Put everything into 1 clear reponse, your reponse will be directly parsed, so make sure to not mention that it's an reponse.

The user prompt is: ${prompt}
`,
      },
      {
        type: "image_url",
        image_url: {
          url: canvasImageUrl,
        },
      },
    ];

    // Add individual images as context
    individualImages.forEach((imageUrl, index) => {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      });
    });

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
      max_tokens: 800,
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;

    if (content) {
      return content;
    } else {
      throw new Error("No content received from prediction");
    }
  } catch (error) {
    console.error("Error predicting user intent:", error);
    throw new Error("Failed to predict user intent");
  }
}

export default async function generate(imagePath, prompt) {
  try {
    let input_image;

    // Check if it's a URL, data URL, or local file path
    if (imagePath.startsWith("http")) {
      // It's already a full URL, use it directly
      input_image = imagePath;
    } else if (imagePath.startsWith("data:")) {
      // It's already a data URL from canvas, use it directly
      input_image = imagePath;
    } else if (imagePath.startsWith("/")) {
      // It's a relative path, read the file and convert to base64
      const fullPath = process.cwd() + "/public" + imagePath;
      const imageBuffer = fs.readFileSync(fullPath);
      const base64Data = imageBuffer.toString("base64");
      input_image = `data:application/octet-stream;base64,${base64Data}`;
    } else {
      // It's a local file path, read the file and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Data = imageBuffer.toString("base64");
      input_image = `data:application/octet-stream;base64,${base64Data}`;
    }

    const input = {
      prompt: prompt,
      input_image: input_image,
      aspect_ratio: "match_input_image",
      output_format: "jpg",
      safety_tolerance: 2,
    };

    // Create the prediction
    const prediction = await replicate.predictions.create({
      model: "black-forest-labs/flux-kontext-max",
      input,
    });

    // Poll for completion
    let finalPrediction = prediction;
    while (finalPrediction.status !== "succeeded" && finalPrediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      finalPrediction = await replicate.predictions.get(prediction.id);
    }

    if (finalPrediction.status === "failed") {
      throw new Error("Prediction failed: " + (finalPrediction.error || "Unknown error"));
    }

    // Return the output URL - Flux Kontext Pro returns a single URI string
    if (finalPrediction.output && typeof finalPrediction.output === "string") {
      return finalPrediction.output;
    } else {
      throw new Error("No output received from prediction");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
