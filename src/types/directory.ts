export interface DirectoryNode {
  name: string;
  children: Map<string, DirectoryNode>;
}

export interface Result<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export type DirectoryCommand = 'CREATE' | 'MOVE' | 'DELETE' | 'LIST';

export interface BaseCommandBody {
  command: DirectoryCommand;
  path?: string;
}

export interface MoveCommandBody extends BaseCommandBody {
  command: 'MOVE';
  path: string;
  destPath: string;
}

export interface StandardCommandBody extends BaseCommandBody {
  command: Exclude<DirectoryCommand, 'MOVE'>;
  path: string;
}

export interface ListCommandBody extends BaseCommandBody {
  command: 'LIST';
}

export type CommandBody = MoveCommandBody | StandardCommandBody | ListCommandBody;

export interface DirectoryResponse {
  message?: string;
  error?: string;
  structure?: string;
}
