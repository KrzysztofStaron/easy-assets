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

export async function compareImages(image1Url, image2Url, prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare these two AI-generated images and determine which one is better. Consider:

1. **Quality**: Which image has better overall quality, sharpness, and detail?
2. **Composition**: Which has better composition, balance, and visual flow?
3. **Lighting**: Which has more natural and appealing lighting?
4. **Colors**: Which has more vibrant, balanced, and professional colors?
5. **Coherence**: Which better matches the user's intent and prompt?
6. **Professional Appeal**: Which looks more like a premium marketing asset?

User's original prompt: "${prompt}"

Respond with ONLY a JSON object in this exact format:
{
  "winner": "image1" or "image2",
  "reason": "Brief explanation of why this image is better",
  "score1": number between 1-10,
  "score2": number between 1-10
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: image1Url,
              },
            },
            {
              type: "image_url",
              image_url: {
                url: image2Url,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;

    try {
      const comparison = JSON.parse(content);
      return {
        winner: comparison.winner,
        reason: comparison.reason,
        score1: comparison.score1,
        score2: comparison.score2,
        image1Url,
        image2Url,
      };
    } catch (parseError) {
      console.warn("JSON parsing failed for comparison, using fallback");
      // Fallback: return image1 as winner if parsing fails
      return {
        winner: "image1",
        reason: "Selected based on default criteria",
        score1: 8,
        score2: 7,
        image1Url,
        image2Url,
      };
    }
  } catch (error) {
    console.error("Error comparing images:", error);
    // Fallback: return image1 as winner if comparison fails
    return {
      winner: "image1",
      reason: "Selected due to comparison failure",
      score1: 8,
      score2: 7,
      image1Url,
      image2Url,
    };
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

    // Create two predictions with different models
    const prediction1 = await replicate.predictions.create({
      model: "black-forest-labs/flux-kontext-max",
      input,
    });

    const prediction2 = await replicate.predictions.create({
      model: "black-forest-labs/flux-kontext-pro",
      input,
    });

    // Poll for completion of both predictions
    let finalPrediction1 = prediction1;
    let finalPrediction2 = prediction2;

    while (
      (finalPrediction1.status !== "succeeded" && finalPrediction1.status !== "failed") ||
      (finalPrediction2.status !== "succeeded" && finalPrediction2.status !== "failed")
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      if (finalPrediction1.status !== "succeeded" && finalPrediction1.status !== "failed") {
        finalPrediction1 = await replicate.predictions.get(prediction1.id);
      }

      if (finalPrediction2.status !== "succeeded" && finalPrediction2.status !== "failed") {
        finalPrediction2 = await replicate.predictions.get(prediction2.id);
      }
    }

    // Check if either prediction failed
    if (finalPrediction1.status === "failed" && finalPrediction2.status === "failed") {
      throw new Error("Both predictions failed");
    }

    // Get the successful outputs
    const image1Url =
      finalPrediction1.status === "succeeded" && typeof finalPrediction1.output === "string"
        ? finalPrediction1.output
        : null;

    const image2Url =
      finalPrediction2.status === "succeeded" && typeof finalPrediction2.output === "string"
        ? finalPrediction2.output
        : null;

    // If only one succeeded, return that one
    if (!image1Url && image2Url) {
      return {
        winner: image2Url,
        comparison: {
          winner: "image2",
          reason: "Only image2 generated successfully",
          score1: 0,
          score2: 8,
          image1Url: null,
          image2Url,
        },
      };
    }

    if (image1Url && !image2Url) {
      return {
        winner: image1Url,
        comparison: {
          winner: "image1",
          reason: "Only image1 generated successfully",
          score1: 8,
          score2: 0,
          image1Url,
          image2Url: null,
        },
      };
    }

    // If both succeeded, compare them
    if (image1Url && image2Url) {
      const comparison = await compareImages(image1Url, image2Url, prompt);
      const winner = comparison.winner === "image1" ? image1Url : image2Url;

      return {
        winner,
        comparison,
      };
    }

    throw new Error("No output received from predictions");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
