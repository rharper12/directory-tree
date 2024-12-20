import { DirectoryService } from '@/services/DirectoryService/DirectoryService';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';

describe('DirectoryService', () => {
  let service: DirectoryService;

  beforeEach(() => {
    service = new DirectoryService();
  });

  describe('requirements integration test', () => {
    it('should match the exact sequence from requirements', () => {
      service.create('fruits');
      service.create('vegetables');
      service.create('grains');
      service.create('fruits/apples');
      service.create('fruits/apples/fuji');

      expect(service.list()).toBe('fruits\n  apples\n    fuji\ngrains\nvegetables');

      service.create('grains/squash');
      service.move('grains/squash', 'vegetables');
      service.create('foods');
      service.move('grains', 'foods');
      service.move('fruits', 'foods');
      service.move('vegetables', 'foods');

      expect(service.list()).toBe(
        'foods\n  fruits\n    apples\n      fuji\n  grains\n  vegetables\n    squash'
      );

      const deleteResult1 = service.delete('fruits/apples');
      expect(deleteResult1.success).toBe(false);
      expect(deleteResult1.error).toBe('Cannot delete fruits/apples - fruits does not exist');

      service.delete('foods/fruits/apples');

      expect(service.list()).toBe('foods\n  fruits\n  grains\n  vegetables\n    squash');
    });
  });

  describe('create', () => {
    it('should create a single directory', () => {
      const result = service.create('fruits');
      expect(result.success).toBe(true);
      expect(service.list()).toBe('fruits');
    });

    it('should create nested directories', () => {
      service.create('fruits');
      service.create('fruits/apples');
      service.create('fruits/apples/fuji');
      expect(service.list()).toBe('fruits\n  apples\n    fuji');
    });

    it('should handle creating existing directory', () => {
      service.create('fruits');
      const result = service.create('fruits');
      expect(result.success).toBe(true);
    });

    it('should reject directories with case-insensitive name conflicts', () => {
      service.create('users');
      const result = service.create('Users');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.DIRECTORY_EXISTS);
    });

    it('should reject empty path', () => {
      const result = service.create('');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_PATH);
    });
  });

  describe('move', () => {
    beforeEach(() => {
      service.create('fruits');
      service.create('fruits/apples');
      service.create('vegetables');
    });

    it('should move directory to new parent', () => {
      const result = service.move('fruits/apples', 'vegetables');
      expect(result.success).toBe(true);
      expect(service.list()).toBe('fruits\nvegetables\n  apples');
    });

    it('should fail when source does not exist', () => {
      const result = service.move('fruits/oranges', 'vegetables');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.CANNOT_MOVE);
    });

    it('should fail when destination does not exist', () => {
      const result = service.move('fruits/apples', 'nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.CANNOT_MOVE);
    });

    it('should fail when moving to destination with name conflict', () => {
      service.create('vegetables/apples');
      const result = service.move('fruits/apples', 'vegetables');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.DIRECTORY_EXISTS);
    });

    it('should fail when moving directory into its own subdirectory', () => {
      const result = service.move('fruits', 'fruits/apples');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.CANNOT_MOVE);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      service.create('fruits');
      service.create('fruits/apples');
      service.create('fruits/apples/fuji');
    });

    it('should delete leaf directory', () => {
      const result = service.delete('fruits/apples/fuji');
      expect(result.success).toBe(true);
      expect(service.list()).toBe('fruits\n  apples');
    });

    it('should delete directory with children', () => {
      const result = service.delete('fruits/apples');
      expect(result.success).toBe(true);
      expect(service.list()).toBe('fruits');
    });

    it('should fail when directory does not exist', () => {
      const result = service.delete('fruits/oranges');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete fruits/oranges - oranges does not exist');
    });

    it('should fail when parent directory does not exist', () => {
      const result = service.delete('nonexistent/folder');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot delete nonexistent/folder - nonexistent does not exist');
    });
  });

  describe('list', () => {
    it('should return empty string for empty root', () => {
      expect(service.list()).toBe('');
    });

    it('should list directories in alphabetical order', () => {
      service.create('zebra');
      service.create('alpha');
      service.create('beta');
      expect(service.list()).toBe('alpha\nbeta\nzebra');
    });

    it('should show proper indentation for nested directories', () => {
      service.create('fruits');
      service.create('fruits/apples');
      service.create('fruits/apples/fuji');
      expect(service.list()).toBe('fruits\n  apples\n    fuji');
    });
  });
});
