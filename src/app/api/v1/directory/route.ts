import { NextResponse } from 'next/server';
import { DirectoryService } from '@/services/DirectoryService/DirectoryService';
import {HTTP_STATUS} from "@/utils/constants/httpStatus";

const directoryService = new DirectoryService();

export async function POST(request: Request) {
    try {
        const { command, path, destPath } = await request.json();

        switch (command.toUpperCase()) {
            case 'CREATE':
                const createResult = directoryService.create(path);
                if (!createResult.success) {
                    return NextResponse.json(
                        { error: createResult.error },
                        { status: HTTP_STATUS.BAD_REQUEST }
                    );
                }
                return NextResponse.json({ message: 'Created' }, { status: HTTP_STATUS.CREATED });

            case 'MOVE':
                const moveResult = directoryService.move(path, destPath);
                if (!moveResult.success) {
                    return NextResponse.json(
                        { error: moveResult.error },
                        { status: HTTP_STATUS.BAD_REQUEST }
                    );
                }
                return NextResponse.json({ message: 'Moved' }, { status: HTTP_STATUS.OK });

            case 'DELETE':
                const deleteResult = directoryService.delete(path);
                if (!deleteResult.success) {
                    return NextResponse.json(
                        { error: deleteResult.error },
                        { status: HTTP_STATUS.BAD_REQUEST }
                    );
                }
                return NextResponse.json({ message: 'Deleted' }, { status: HTTP_STATUS.OK });

            case 'LIST':
                return NextResponse.json(
                    { structure: directoryService.list() },
                    { status: HTTP_STATUS.OK }
                );

            default:
                return NextResponse.json(
                    { error: 'Invalid command' },
                    { status: HTTP_STATUS.BAD_REQUEST }
                );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: HTTP_STATUS.SERVER_ERROR }
        );
    }
}