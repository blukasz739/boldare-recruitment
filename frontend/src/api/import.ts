import type {
  ImportAnalyzeResponse,
  ImportConfirmResponse,
  ImportProposal,
} from '../types/subscription';
import { apiClient, apiClientFormData } from './client';

export async function analyzeImport(
  file: File,
  apiKey: string,
): Promise<ImportAnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);

  return apiClientFormData<ImportAnalyzeResponse>('/api/import/analyze', formData);
}

export async function confirmImport(
  proposals: ImportProposal[],
): Promise<ImportConfirmResponse> {
  return apiClient<ImportConfirmResponse>('/api/import/confirm', {
    method: 'POST',
    body: JSON.stringify({ proposals }),
  });
}
