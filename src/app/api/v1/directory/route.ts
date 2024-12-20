import { NextRequest, NextResponse } from 'next/server';
import { DirectoryService } from '@/services/DirectoryService/DirectoryService';
import { HTTP_STATUS } from '@/utils/constants/httpStatus';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';
import { SUCCESS_MESSAGES } from '@/utils/constants/successMessages';

const directoryService = new DirectoryService();

/**
 * NOTE: In Next.js 15, the method names (e.g., GET, POST) must match HTTP methods exactly.
 */

/**
 * Retrieves all directories
 * @route GET /api/v1/directories
 */
export function GET() {
  try {
    const structure = directoryService.list();
    return NextResponse.json({ structure }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to retrieve directories:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.FAILED_RETRIEVE },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }
}

/**
 * Creates a new directory
 * @route POST /api/v1/directories
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      console.error('Invalid JSON in request');
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: HTTP_STATUS.UNSUPPORTED_MEDIA }
      );
    }

    if (!body?.path) {
      console.warn('Missing path in request');
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_PATH },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = directoryService.create(body.path);
    if (!result.success) {
      console.warn('Failed to create directory:', result.error);
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.FAILED_CREATE },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { message: SUCCESS_MESSAGES.DIRECTORY_CREATED },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Unexpected error in create:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.FAILED_CREATE },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }
}

/**
 * Updates a directory location
 * @route PATCH /api/v1/directories
 */
export async function PATCH(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      console.error('Invalid JSON in request');
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_REQUEST },
        { status: HTTP_STATUS.UNSUPPORTED_MEDIA }
      );
    }

    if (!body?.path || !body?.destPath) {
      console.warn('Missing required paths in request');
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_PATHS },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = directoryService.move(body.path, body.destPath);
    if (!result.success) {
      console.warn('Failed to move directory:', result.error);
      if (result.error?.includes('not found')) {
        return NextResponse.json({ error: result.error }, { status: HTTP_STATUS.NOT_FOUND });
      }
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.FAILED_UPDATE },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { message: SUCCESS_MESSAGES.DIRECTORY_UPDATED },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Unexpected error in update:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.FAILED_UPDATE },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }
}

/**
 * Removes a directory
 * @route DELETE /api/v1/directories?path={path}
 */
export async function DELETE(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
      console.warn('Missing path in delete request');
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_PATH },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = directoryService.delete(path);
    if (!result.success) {
      console.warn('Failed to delete directory:', result.error);
      if (result.error?.includes('not exist')) {
        return NextResponse.json({ error: result.error }, { status: HTTP_STATUS.NOT_FOUND });
      }
      return NextResponse.json(
        { error: result.error || ERROR_MESSAGES.FAILED_DELETE },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    return NextResponse.json(
      { message: SUCCESS_MESSAGES.DIRECTORY_REMOVED },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Unexpected error in delete:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.FAILED_DELETE },
      { status: HTTP_STATUS.SERVER_ERROR }
    );
  }
}
