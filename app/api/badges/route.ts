import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://k-connect.ru/api/badges/trending", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(
        `fetch to https://k-connect.ru/api/badges/trending failed with status ${response.status}`
      )
      return NextResponse.json(
        { success: false, badges: [], error: `API returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching badges:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch badges", badges: [] },
      { status: 500 }
    )
  }
}
