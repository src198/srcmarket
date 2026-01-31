const API_BASE = "https://k-connect.ru"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  try {
    const response = await fetch(
      `${API_BASE}/api/username/history/${username}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Error fetching history:", error)
    return Response.json(
      { success: false, error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}
