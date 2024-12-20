import { DirectoryNode, Result } from '@/types/directory';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';

/**
 * DirectoryService manages a virtual directory structure in memory.
 * Provides functionality to create, move, delete, and list directories.
 *
 * The service maintains a hierarchical directory structure where:
 * - Directory names are case-sensitive for exact matches
 * - Directory names are case-insensitive for conflict checking
 * - Paths use forward slashes as separators
 */
export class DirectoryService {
  /** Root node of the directory tree */
  private readonly root: DirectoryNode;

  /**
   * Initializes a new DirectoryService with an empty root directory.
   * The root directory has an empty name and serves as the base for all operations.
   */
  constructor() {
    this.root = {
      name: '',
      children: new Map(),
    };
  }

  /**
   * Splits a path string into its constituent segments, filtering out empty segments.
   * @param path - The path string to parse
   * @returns Array of non-empty path segments
   * @private
   */
  private parsePath(path: string): string[] {
    return path.split('/').filter((segment) => segment.length > 0);
  }

  /**
   * Traverses the directory tree to find a specific node and its parent.
   * @param segments - Array of path segments to traverse
   * @returns Object containing the found node and its parent, both can be null if not found
   * @private
   */
  private findNode(segments: string[]): {
    node: DirectoryNode | null;
    parent: DirectoryNode | null;
  } {
    let current = this.root;
    let parent = null;

    for (const segment of segments) {
      parent = current;
      const next = current.children.get(segment);
      if (!next) return { node: null, parent };
      current = next;
    }

    return { node: current, parent };
  }

  /**
   * Checks if a directory with the given name exists in the parent directory (case-insensitive).
   * @param parent - The parent directory node to check in
   * @param name - The name to check for
   * @returns True if a matching name exists (case-insensitive), false otherwise
   * @private
   */
  private hasChildIgnoreCase(parent: DirectoryNode, name: string): boolean {
    return Array.from(parent.children.keys()).some(
      (childName) => childName.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Creates a new directory at the specified path.
   * @param path - The path where the directory should be created
   * @returns Result object indicating success or failure with error message
   * @throws Will return error if the path is invalid or if a name conflict exists
   */
  create(path: string): Result {
    const segments = this.parsePath(path);
    if (segments.length === 0) {
      return { success: false, error: ERROR_MESSAGES.INVALID_PATH };
    }

    let current = this.root;
    for (const segment of segments) {
      const next = current.children.get(segment);

      if (next) {
        current = next;
        continue;
      }

      if (this.hasChildIgnoreCase(current, segment)) {
        return { success: false, error: ERROR_MESSAGES.DIRECTORY_EXISTS };
      }

      const newNode: DirectoryNode = {
        name: segment,
        children: new Map(),
      };
      current.children.set(segment, newNode);
      current = newNode;
    }

    return { success: true };
  }

  /**
   * Moves a directory from source path to destination path.
   * @param sourcePath - The path of the directory to move
   * @param destPath - The destination path where the directory should be moved
   * @returns Result indicating success or failure with error message
   * @throws Will return error if source or destination don't exist,
   *         if attempting to move a directory into its own subdirectory,
   *         or if a name conflict exists at the destination
   */
  move(sourcePath: string, destPath: string): Result {
    const sourceSegments = this.parsePath(sourcePath);
    const destSegments = this.parsePath(destPath);

    if (sourceSegments.length === 0 || destSegments.length === 0) {
      return { success: false, error: ERROR_MESSAGES.INVALID_PATH };
    }

    const { node: sourceNode, parent: sourceParent } = this.findNode(sourceSegments);
    if (!sourceNode || !sourceParent) {
      return { success: false, error: ERROR_MESSAGES.CANNOT_MOVE };
    }

    const { node: destNode } = this.findNode(destSegments);
    if (!destNode) {
      return { success: false, error: ERROR_MESSAGES.CANNOT_MOVE };
    }

    if (
      sourcePath.toLowerCase() === destPath.toLowerCase() ||
      destPath.toLowerCase().startsWith(sourcePath.toLowerCase() + '/')
    ) {
      return { success: false, error: ERROR_MESSAGES.CANNOT_MOVE };
    }

    const sourceName = sourceSegments[sourceSegments.length - 1];
    if (this.hasChildIgnoreCase(destNode, sourceName)) {
      return { success: false, error: ERROR_MESSAGES.DIRECTORY_EXISTS };
    }

    sourceParent.children.delete(sourceName);
    destNode.children.set(sourceName, sourceNode);
    return { success: true };
  }

  /**
   * Deletes a directory and all its subdirectories at the specified path.
   * @param path - The path of the directory to delete
   * @returns Result indicating success or failure with error message
   * @throws Will return error if the path doesn't exist or is invalid
   */
  delete(path: string): Result {
    const segments = this.parsePath(path);

    if (segments.length === 0) {
      return { success: false, error: ERROR_MESSAGES.INVALID_PATH };
    }

    let current = this.root;

    for (let i = 0; i < segments.length - 1; i++) {
      const next = current.children.get(segments[i]);
      if (!next) {
        return {
          success: false,
          error: `Cannot delete ${path} - ${segments[i]} does not exist`,
        };
      }
      current = next;
    }

    const lastSegment = segments[segments.length - 1];
    if (!current.children.has(lastSegment)) {
      return {
        success: false,
        error: `Cannot delete ${path} - ${lastSegment} does not exist`,
      };
    }

    current.children.delete(lastSegment);
    return { success: true };
  }

  /**
   * Generates a formatted string representation of the entire directory structure.
   * @returns Formatted string representing the directory structure, with each directory
   *          on a new line, child directories indented with two spaces per level,
   *          and directories at each level sorted alphabetically
   */
  list(): string {
    let result = '';

    const printNode = (node: DirectoryNode, depth: number = 0) => {
      if (depth > 0) {
        result += '  '.repeat(depth - 1) + node.name;
      }

      const sortedChildren = Array.from(node.children.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      for (const child of sortedChildren) {
        if (result) result += '\n';
        printNode(child, depth + 1);
      }
    };

    printNode(this.root);
    return result;
  }
}
