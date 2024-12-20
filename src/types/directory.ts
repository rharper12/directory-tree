export interface DirectoryNode {
  name: string;
  children: Map<string, DirectoryNode>;
}

export interface Result<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}
export interface DirectoryResponse {
  message?: string;
  error?: string;
  structure?: string;
}
