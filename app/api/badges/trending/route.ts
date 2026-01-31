import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://k-connect.ru/api/badges/trending", {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching trending badges:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending badges", badges: [] },
      { status: 500 }
    )
  }
}
