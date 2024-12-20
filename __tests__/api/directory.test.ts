import { NextRequest } from 'next/server';
import { HTTP_STATUS } from '@/utils/constants/httpStatus';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';
import { SUCCESS_MESSAGES } from '@/utils/constants/successMessages';
import { DELETE, GET, PATCH, POST } from '@/app/api/v1/directory/route';

jest.mock('@/services/DirectoryService/DirectoryService', () => {
  return {
    DirectoryService: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockImplementation((path: string) => {
        if (!path) return { success: false, error: ERROR_MESSAGES.INVALID_PATH };
        if (path === '/existing') return { success: false, error: ERROR_MESSAGES.DIRECTORY_EXISTS };
        return { success: true };
      }),
      move: jest.fn().mockImplementation((sourcePath: string, destPath: string) => {
        if (!sourcePath || !destPath) {
          return { success: false, error: ERROR_MESSAGES.MISSING_PATHS };
        }
        if (sourcePath === '/nonexistent') {
          return { success: false, error: ERROR_MESSAGES.CANNOT_MOVE };
        }
        return { success: true };
      }),
      delete: jest.fn().mockImplementation((path: string) => {
        if (!path) {
          return { success: false, error: ERROR_MESSAGES.INVALID_PATH };
        }
        if (path === '/nonexistent') {
          return { success: false, error: ERROR_MESSAGES.CANNOT_DELETE };
        }
        return { success: true };
      }),
      list: jest.fn().mockReturnValue('folder1\n  subfolder1\n  subfolder2\nfolder2'),
    })),
  };
});

describe('Directory API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/directory', () => {
    it('should return formatted directory structure', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data).toHaveProperty('structure');
      expect(data.structure).toContain('folder1');
      expect(data.structure).toContain('subfolder1');
    });
  });

  describe('POST /api/v1/directory', () => {
    it('should handle invalid JSON', async () => {
      const response = await POST(
        new NextRequest('http://localhost', {
          method: 'POST',
          body: 'invalid json',
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.UNSUPPORTED_MEDIA);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_REQUEST);
    });

    it('should reject creation without path', async () => {
      const response = await POST(
        new NextRequest('http://localhost', {
          method: 'POST',
          body: JSON.stringify({}),
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_PATH);
    });

    it('should create directory with valid path', async () => {
      const response = await POST(
        new NextRequest('http://localhost', {
          method: 'POST',
          body: JSON.stringify({
            path: '/documents/reports',
          }),
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(data.message).toBe(SUCCESS_MESSAGES.DIRECTORY_CREATED);
    });
  });

  describe('PATCH /api/v1/directory', () => {
    it('should handle invalid JSON', async () => {
      const response = await PATCH(
        new NextRequest('http://localhost', {
          method: 'PATCH',
          body: 'invalid json',
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.UNSUPPORTED_MEDIA);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_REQUEST);
    });

    it('should require both paths', async () => {
      const response = await PATCH(
        new NextRequest('http://localhost', {
          method: 'PATCH',
          body: JSON.stringify({
            path: '/source',
          }),
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.error).toBe(ERROR_MESSAGES.MISSING_PATHS);
    });

    it('should move directory with valid paths', async () => {
      const response = await PATCH(
        new NextRequest('http://localhost', {
          method: 'PATCH',
          body: JSON.stringify({
            path: '/source',
            destPath: '/target',
          }),
        })
      );

      const data = await response.json();
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data.message).toBe(SUCCESS_MESSAGES.DIRECTORY_UPDATED);
    });
  });

  describe('DELETE /api/v1/directory', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should require path parameter', async () => {
      const url = new URL('http://localhost/api/v1/directory');
      const req = new NextRequest(url);
      Object.defineProperty(req, 'nextUrl', {
        get: () => url,
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data.error).toBe(ERROR_MESSAGES.INVALID_PATH);
    });

    it('should delete existing directory', async () => {
      const url = new URL('http://localhost/api/v1/directory');
      url.searchParams.set('path', '/toDelete');
      const req = new NextRequest(url);
      Object.defineProperty(req, 'nextUrl', {
        get: () => url,
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data.message).toBe(SUCCESS_MESSAGES.DIRECTORY_REMOVED);
    });

    it('should handle nonexistent directory', async () => {
      const url = new URL('http://localhost/api/v1/directory');
      url.searchParams.set('path', '/nonexistent');
      const req = new NextRequest(url);
      Object.defineProperty(req, 'nextUrl', {
        get: () => url,
      });

      const response = await DELETE(req);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data.error).toContain('does not exist');
    });
  });
});
