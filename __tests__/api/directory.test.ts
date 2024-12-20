import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/directory/route';
import { HTTP_STATUS } from '@/utils/constants/httpStatus';

jest.mock('@/services/DirectoryService/DirectoryService', () => {
    return {
        DirectoryService: jest.fn().mockImplementation(() => ({
            create: jest.fn().mockImplementation((path: string) => {
                if (!path) return { success: false, error: 'Invalid path' };
                if (path === '/existing') return { success: false, error: 'Directory already exists' };
                if (path.includes('..')) return { success: false, error: 'Invalid path format' };
                return { success: true };
            }),
            move: jest.fn().mockImplementation((sourcePath: string, destPath: string) => {
                if (sourcePath === '/nonexistent') {
                    return { success: false, error: 'Source directory not found' };
                }
                if (destPath === '/nonexistent') {
                    return { success: false, error: 'Destination directory not found' };
                }
                if (destPath === '/existing') {
                    return { success: false, error: 'Name conflict in destination directory' };
                }
                return { success: true };
            }),
            delete: jest.fn().mockImplementation((path: string) => {
                if (path === '/nonexistent') {
                    return { success: false, error: 'Directory not found' };
                }
                if (path === '/protected') {
                    return { success: false, error: 'Cannot delete protected directory' };
                }
                return { success: true };
            }),
            list: jest.fn().mockReturnValue('folder1\n  subfolder1\n  subfolder2\nfolder2')
        }))
    };
});

describe('Directory API Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Input Validation', () => {
        it('should reject requests with missing or invalid command', async () => {
            const responseNoCommand = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    path: '/test'
                })
            }));

            const dataNoCommand = await responseNoCommand.json();
            expect(responseNoCommand.status).toBe(HTTP_STATUS.SERVER_ERROR);
            expect(dataNoCommand.error).toBe('Internal server error');

            const responseUndefinedCommand = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: undefined,
                    path: '/test'
                })
            }));

            const dataUndefinedCommand = await responseUndefinedCommand.json();
            expect(responseUndefinedCommand.status).toBe(HTTP_STATUS.SERVER_ERROR);
            expect(dataUndefinedCommand.error).toBe('Internal server error');

            const responseEmptyCommand = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: '',
                    path: '/test'
                })
            }));

            const dataEmptyCommand = await responseEmptyCommand.json();
            expect(responseEmptyCommand.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(dataEmptyCommand.error).toBe('Invalid command');
        });

        it('should handle malformed JSON gracefully', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: 'invalid{json'
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.SERVER_ERROR);
            expect(data.error).toBe('Internal server error');
        });

        it('should validate command format', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'INVALID_COMMAND',
                    path: '/test'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toBe('Invalid command');
        });
    });

    describe('CREATE Operation', () => {
        it('should create a new directory with valid path', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'CREATE',
                    path: '/documents/reports'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(data.message).toBe('Created');
        });

        it('should reject creation with empty path', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'CREATE',
                    path: ''
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toBeTruthy();
        });

        it('should prevent directory creation with path traversal', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'CREATE',
                    path: '../documents'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toBeTruthy();
        });

        it('should handle name conflicts during creation', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'CREATE',
                    path: '/existing'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toContain('already exists');
        });
    });

    describe('MOVE Operation', () => {
        it('should move directory to valid destination', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'MOVE',
                    path: '/source',
                    destPath: '/target'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(data.message).toBe('Moved');
        });

        it('should fail when source directory does not exist', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'MOVE',
                    path: '/nonexistent',
                    destPath: '/target'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toContain('not found');
        });

        it('should handle name conflicts in destination', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'MOVE',
                    path: '/source',
                    destPath: '/existing'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toContain('conflict');
        });
    });

    describe('DELETE Operation', () => {
        it('should delete existing directory', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'DELETE',
                    path: '/toDelete'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(data.message).toBe('Deleted');
        });

        it('should fail when deleting non-existent directory', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'DELETE',
                    path: '/nonexistent'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toContain('not found');
        });

        it('should handle protected directories', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'DELETE',
                    path: '/protected'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toContain('protected');
        });
    });

    describe('LIST Operation', () => {
        it('should return formatted directory structure', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'LIST'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(data).toHaveProperty('structure');
            expect(data.structure).toContain('folder1');
            expect(data.structure).toContain('subfolder1');
        });
    });

    describe('Command Validation', () => {
        it('should reject unknown commands', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'UNKNOWN',
                    path: '/test'
                })
            }));

            const data = await response.json();
            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(data.error).toBe('Invalid command');
        });

        it('should handle case-insensitive commands', async () => {
            const response = await POST(new NextRequest('http://localhost', {
                method: 'POST',
                body: JSON.stringify({
                    command: 'create',
                    path: '/newdir'
                })
            }));
            await response.json();
            expect(response.status).toBe(HTTP_STATUS.CREATED);
        });
    });
});