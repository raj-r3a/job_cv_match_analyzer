// Create the mock function outside the mock definition so we can access it
const mockedPost = jest.fn();

// Mock axios before any imports
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      post: mockedPost,
    })),
    isAxiosError: jest.fn((err: any) => err?.isAxiosError === true),
  },
  isAxiosError: jest.fn((err: any) => err?.isAxiosError === true),
}));

import axios, { AxiosError } from 'axios';
import { generateContentRequest } from '../../src/utils/aiApiSdk';
import { GenerateContentRequest } from '../../src/types';
import { geminiApiConfig } from '../../src/config/constants';

describe('generateContentRequest', () => {
  const requestBody: GenerateContentRequest = {
    contents: [{
      role: 'user',
      parts: [{ text: 'test' }]
    }]
  };

  const endpoint = 'https://fake.gemini.endpoint/api';
  const token = 'Bearer dummy-token';

  beforeEach(() => {
    // mock config constants
    geminiApiConfig.endpoint = endpoint;
    geminiApiConfig.authToken = token;
    
    // Clear the mock
    mockedPost.mockClear();
    
    // Debug: Let's see what we have
    console.log('axios:', typeof axios);
    console.log('axios.create:', typeof axios.create);
    console.log('mockedPost:', typeof mockedPost);
    console.log('axios.create result:', axios.create({}));
  });

  it('should return response data on success', async () => {
    const mockResponse = { data: { message: 'success' }, status: 200 };
    mockedPost.mockResolvedValue(mockResponse);

    const data = await generateContentRequest(requestBody);

    expect(data).toEqual(mockResponse.data);
    expect(mockedPost).toHaveBeenCalledWith(endpoint, requestBody);
  });

  it('should throw error for 500 status', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 500 },
    } as AxiosError;
    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'Gemini is unresponsive. Please try again later.'
    );
  });

  it('should throw error for 401 status', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 401 },
    } as AxiosError;

    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'Unauthorized access to Gemini. Check your credentials.'
    );
  });

  it('should throw error for 403 status', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 403 },
    } as AxiosError;

    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'Access to Gemini is forbidden. You might not have the right permissions.'
    );
  });

  it('should throw error for 404 status', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 404 },
    } as AxiosError;

    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'Gemini endpoint not found. Please verify the URL.'
    );
  });

  it('should throw error for other Axios error statuses', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 429, statusText: 'Too Many Requests' },
    } as AxiosError;

    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'Gemini request failed with status 429: Too Many Requests'
    );
  });

  it('should throw general error for non-Axios errors', async () => {
    const error = new Error('Unexpected failure');

    mockedPost.mockRejectedValue(error);

    await expect(generateContentRequest(requestBody)).rejects.toThrow(
      'An unexpected error occurred while communicating with Gemini.'
    );
  });
});