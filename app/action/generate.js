"use server";

import Replicate from "replicate";
import fs from "node:fs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

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
      model: "black-forest-labs/flux-kontext-pro",
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
