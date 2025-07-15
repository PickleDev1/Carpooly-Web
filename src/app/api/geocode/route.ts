import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found for reverse geocoding')
      return NextResponse.json({
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      })
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0]
      const address = result.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      
      return NextResponse.json({ address })
    } else {
      console.warn('No address found for coordinates:', latitude, longitude, 'Status:', data.status)
      return NextResponse.json({
        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      })
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode coordinates' },
      { status: 500 }
    )
  }
} 