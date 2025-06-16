import { formGenerateContentPayloadWithFiles } from '../../src/utils/helpers';
import { SchemaType } from '../../src/types';

describe('Helpers Utility Functions', () => {
  describe('formGenerateContentPayloadWithFiles', () => {
    const mockJd = 'base64EncodedJD';
    const mockCv = 'base64EncodedCV';

    it('should create a valid GenerateContentRequest payload', () => {
      const payload = formGenerateContentPayloadWithFiles(mockJd, mockCv);

      // Test basic structure
      expect(payload).toHaveProperty('contents');
      expect(payload.contents).toHaveLength(1);
      expect(payload.contents[0]).toHaveProperty('role', 'user');
      expect(payload.contents[0].parts).toHaveLength(3);

      // Test generation config
      expect(payload).toHaveProperty('generationConfig');
      const config = payload.generationConfig!;

      // Test response schema
      expect(config.responseSchema).toMatchObject({
        type: SchemaType.OBJECT,
        properties: {
          overallMatch: {
            type: SchemaType.OBJECT,
            nullable: false,
            properties: {
              score: { type: SchemaType.NUMBER },
              summary: { type: SchemaType.STRING }
            }
          }
        }
      });
    });

    it('should include both JD and CV in the payload', () => {
      const payload = formGenerateContentPayloadWithFiles(mockJd, mockCv);
      const parts = payload.contents[0].parts;

      // Check if both PDFs are included
      expect(parts[1].inlineData).toMatchObject({
        mimeType: 'application/pdf',
        data: mockJd
      });

      expect(parts[2].inlineData).toMatchObject({
        mimeType: 'application/pdf',
        data: mockCv
      });
    });
  });
}); 