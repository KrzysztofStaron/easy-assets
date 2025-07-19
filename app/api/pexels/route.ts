import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Pexels API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to include the image URLs we need
    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      url: photo.src.medium, // Use medium size for better performance
      alt: photo.alt,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Pexels API error:", error);
    return NextResponse.json({ error: "Failed to fetch images from Pexels" }, { status: 500 });
  }
}
