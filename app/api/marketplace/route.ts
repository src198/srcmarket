const API_BASE = "https://k-connect.ru"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "active"

  try {
    const response = await fetch(
      `${API_BASE}/api/username/marketplace?status=${status}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching marketplace:", error)
    return Response.json(
      { success: false, error: "Failed to fetch marketplace" },
      { status: 500 }
    )
  }
}
