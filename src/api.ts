export type VideoProvider = 'veo' | 'kling' | 'local';

export interface VideoGenerationRequest {
  motion: string;
  aspect?: '16:9' | '9:16';
  speed?: 'normal' | 'fast';
  duration?: number;
  provider?: VideoProvider;
}

export interface VideoGenerationResponse {
  url: string;
  model: string;
  aspect?: string;
  provider?: string;
}

export interface ApiError {
  error: string;
}

export async function generateVideo(
  imageFile: File,
  options: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  const provider = options.provider || 'local'; // Default to Local processing
  const endpoint = `/api/video/${provider}`;
  
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('motion', options.motion);
  
  if (options.aspect) formData.append('aspect', options.aspect);
  if (options.speed) formData.append('speed', options.speed);
  if (options.duration) formData.append('duration', options.duration.toString());

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}