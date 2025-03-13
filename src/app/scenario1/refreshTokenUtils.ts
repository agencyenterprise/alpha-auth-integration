export async function refreshTokens(refreshToken: string): Promise<{
  id_token: string;
  access_token: string;
  refresh_token: string;
}> {
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  
  if (!clientId || !cognitoDomain) {
    throw new Error('Cognito configuration missing');
  }
  
  const tokenEndpoint = `${cognitoDomain}/oauth2/token`;
  
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', clientId);
  params.append('refresh_token', refreshToken);
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Failed to refresh tokens');
    }
    
    const data = await response.json();
    
    return {
      id_token: data.id_token,
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Some implementations don't return a new refresh token
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
} 