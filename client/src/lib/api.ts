export interface AnalyzeResponse {
  status: 'incomplete' | 'complete' | 'error'
  message: string
  passportCountry?: string
  destinationCountry?: string
  detected_passport?: string
  detected_destination?: string
}

export async function analyzeMessage(
  message: string,
  imageFile?: File | null
): Promise<AnalyzeResponse> {
  const url = `http://localhost:5000/analyze-message`

  // Build fetch options
  let headers: Record<string, string> = {}
  let body: BodyInit

  if (imageFile) {
    const form = new FormData()
    form.append('message', message)
    form.append('image', imageFile)
    body = form
  } else {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify({ message })
  }

  const opts: RequestInit = {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers,
    body
  }

  try {
    const res = await fetch(url, opts)

    // Try to parse JSON if possible
    const contentType = res.headers.get('Content-Type') || ''
    let data: any
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      // fallback to text
      const text = await res.text()
      throw new Error(text || res.statusText)
    }

    if (!res.ok) {
      // The server sent a 4xx or 5xx with a JSON payload
      return {
        status: data.status ?? 'error',
        message: data.message ?? JSON.stringify(data),
        passportCountry: data.passportCountry,
        destinationCountry: data.destinationCountry,
        detected_passport: data.detected_passport,
        detected_destination: data.detected_destination
      }
    }

    // All good
    return data as AnalyzeResponse

  } catch (err: any) {
    // Network error or parsing error
    console.error('analyzeMessage error:', err)
    return {
      status: 'error',
      message: err.message ?? 'Network or parsing error'
    }
  }
}
