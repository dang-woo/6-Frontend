import { NextResponse } from 'next/server'

export async function GET (
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const awaitedParams = await params;
  const itemId = awaitedParams.itemId;

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
  }

  // 네오플 API 키가 필요하다면 환경 변수에서 가져옵니다.
  const NEOPLE_API_KEY = process.env.NEOPLE_API_KEY;
  const neopleItemUrl = `https://api.neople.co.kr/df/items/${itemId}?apikey=${NEOPLE_API_KEY}`; // 아이템 정보 API
  const directImageUrl = `https://img-api.neople.co.kr/df/items/${itemId}`

  try {
    const imageResponse = await fetch(directImageUrl, { method: 'HEAD' })

    if (imageResponse.ok) {
      return NextResponse.json({ imageUrl: directImageUrl })
    } else {
      console.warn(`Neople API returned status ${imageResponse.status} for item image: ${itemId}`)
      return NextResponse.json({ imageUrl: null, error: `Image not found or accessible for item ID: ${itemId}` }, { status: imageResponse.status })
    }
  } catch (error) {
    console.error(`Error fetching item image for ${itemId} from Neople API:`, error)
    return NextResponse.json({ error: 'Failed to fetch item image due to a network or server error' }, { status: 500 })
  }
} 