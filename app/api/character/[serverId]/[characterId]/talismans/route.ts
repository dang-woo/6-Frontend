import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NeopleTalismanApiResponseDTO } from '@/types/dnf';

const NEOPLE_API_KEY = process.env.NEOPLE_API_KEY;
const NEOPLE_API_BASE_URL = 'https://api.neople.co.kr/df';

interface Params {
  serverId: string;
  characterId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { serverId, characterId } = params;

  if (!NEOPLE_API_KEY) {
    console.error('[API /talismans] NEOPLE_API_KEY is not configured.');
    return NextResponse.json({ error: 'Server configuration error: API key missing' }, { status: 500 });
  }

  if (!serverId || !characterId) {
    return NextResponse.json({ error: 'Missing serverId or characterId' }, { status: 400 });
  }

  const neopleApiUrl = `${NEOPLE_API_BASE_URL}/servers/${serverId}/characters/${characterId}/equip/talisman?apikey=${NEOPLE_API_KEY}`;

  try {
    const response = await fetch(neopleApiUrl, { cache: 'no-store' }); // 캐시 전략은 필요에 따라 변경

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[API /talismans] Neople API error for ${characterId} on ${serverId}: ${response.status}`, errorData);
      return NextResponse.json(
        { 
          error: `Failed to fetch talisman data from Neople API. Status: ${response.status}`,
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data: NeopleTalismanApiResponseDTO = await response.json();
    
    // data 객체 전체를 반환 (이 안에는 serverId, characterId, characterName, talismans 배열 등이 포함됨)
    return NextResponse.json(data);

  } catch (error) {
    console.error(`[API /talismans] Error fetching talisman data for ${characterId} on ${serverId}:`, error);
    return NextResponse.json({ error: 'Internal server error while fetching talisman data' }, { status: 500 });
  }
} 