import { DirectoryNode, Result } from '@/types/directory';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';

export class DirectoryService {
    private readonly root: DirectoryNode;

    constructor() {
        this.root = {
            name: 'root',
            children: new Map()
        };
    }

    private parsePath(path: string): string[] {
        return path.replace(/^\//, '').split('/').filter(segment => segment.length > 0);
    }

    private findNode(segments: string[]): DirectoryNode | null {
        let current = this.root;
        for (const segment of segments) {
            const next = current.children.get(segment);
            if (!next) return null;
            current = next;
        }
        return current;
    }

    private findParentNode(segments: string[]): DirectoryNode | null {
        if (segments.length === 0) return null;
        return this.findNode(segments.slice(0, -1)) || this.root;
    }

    private isNameConflict(parent: DirectoryNode, newName: string): boolean {
        return Array.from(parent.children.keys()).some(
            existingName => existingName.toLowerCase() === newName.toLowerCase()
        );
    }

    create(path: string): Result {
        const segments = this.parsePath(path);
        if (segments.length === 0) {
            return {
                success: false,
                error: 'Invalid path'
            };
        }

        let current = this.root;
        for (const segment of segments) {
            // Check for case-insensitive name conflicts
            if (!current.children.has(segment) && this.isNameConflict(current, segment)) {
                return {
                    success: false,
                    error: `Cannot create directory - name conflict with existing directory: ${segment}`
                };
            }

            if (!current.children.has(segment)) {
                current.children.set(segment, {
                    name: segment,
                    children: new Map()
                });
            }
            current = current.children.get(segment)!;
        }

        return { success: true };
    }

    move(sourcePath: string, destPath: string): Result {
        const sourceSegments = this.parsePath(sourcePath);
        const destSegments = this.parsePath(destPath);

        const sourceNode = this.findNode(sourceSegments);
        if (!sourceNode) {
            return { success: false, error: ERROR_MESSAGES.DIRECTORY_NOT_FOUND };
        }

        const destParent = this.findNode(destSegments);
        if (!destParent) {
            return { success: false, error: ERROR_MESSAGES.DIRECTORY_NOT_FOUND };
        }

        if (this.isNameConflict(destParent, sourceNode.name)) {
            return {
                success: false,
                error: `Cannot move directory - name conflict in destination directory`
            };
        }

        const sourceParent = this.findParentNode(sourceSegments);
        if (sourceParent) {
            sourceParent.children.delete(sourceSegments[sourceSegments.length - 1]);
        }

        destParent.children.set(sourceNode.name, sourceNode);
        return { success: true };
    }

    delete(path: string): Result {
        const segments = this.parsePath(path);
        const parent = this.findParentNode(segments);

        if (!parent || !this.findNode(segments)) {
            return {
                success: false,
                error: `Cannot delete ${path} - ${segments[0]} does not exist`
            };
        }

        parent.children.delete(segments[segments.length - 1]);
        return { success: true };
    }

    list(): string {
        let result = '';

        const printNode = (node: DirectoryNode, depth: number = 0) => {
            if (depth > 0) {
                result += '  '.repeat(depth - 1) + node.name;
            }

            const sortedChildren = Array.from(node.children.values())
                .sort((a, b) => a.name.localeCompare(b.name));

            for (const child of sortedChildren) {
                if (result) result += '\n';
                printNode(child, depth + 1);
            }
        };

        printNode(this.root);
        return result;
    }
}