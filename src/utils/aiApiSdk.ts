import axios from 'axios';
import { geminiApiConfig } from '../config/constants';
import { GenerateContentRequest } from '../types';
import { logger } from './logger';

const apiClient = axios.create({
  headers: {
    Authorization: geminiApiConfig.authToken,
  },
});

export async function generateContentRequest(body: GenerateContentRequest) {
  try {
    const response = await apiClient.post(
      geminiApiConfig.endpoint as string,
      body
    );
    return response.data;
  } catch (error) {
    logger.error({ message: 'http error from generateContentRequest', error });
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 500) {
        throw new Error('Gemini is unresponsive. Please try again later.');
      }

      if (status === 401) {
        throw new Error(
          'Unauthorized access to Gemini. Check your credentials.'
        );
      }

      if (status === 429) {
        throw new Error(
          'Gemini api is rate limited, Please try after sometime, in about a minute.'
        );
      }

      if (status === 403) {
        throw new Error(
          'Access to Gemini is forbidden. You might not have the right permissions.'
        );
      }

      if (status === 404) {
        throw new Error('Gemini endpoint not found. Please verify the URL.');
      }

      throw new Error(
        `Gemini request failed with status ${status}: ${error.response?.statusText}`
      );
    }

    throw new Error(
      'An unexpected error occurred while communicating with Gemini.'
    );
  }
}
