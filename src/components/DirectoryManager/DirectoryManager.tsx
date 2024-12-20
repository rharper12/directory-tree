'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HTTP_STATUS } from '@/utils/constants/httpStatus';
import { ERROR_MESSAGES } from '@/utils/constants/errorMessages';
import { DirectoryResponse } from '@/types/directory';

/**
 * DirectoryManager provides a command-line interface for managing directories
 */
export default function DirectoryManager() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const formatOutput = (command: string, response: string): string => {
    const parts = command.split(' ');
    const formattedCommand = `> ${parts[0].toUpperCase()}${
      parts.length > 1 ? ' ' + parts.slice(1).join(' ') : ''
    }`;
    const spacing = output ? '\n' : '';

    if (parts[0].toUpperCase() === 'LIST') {
      return `${spacing}${formattedCommand}${response}`;
    }

    return `${spacing}${formattedCommand}${response ? '\n' + response : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!command.trim()) {
      return;
    }

    try {
      const [cmd, ...args] = command.trim().split(' ');
      const upperCmd = cmd.toUpperCase();
      let response: Response;

      switch (upperCmd) {
        case 'LIST':
          response = await fetch('/api/v1/directory');
          break;

        case 'CREATE':
          if (!args[0]) {
            setError(ERROR_MESSAGES.INVALID_PATH);
            return;
          }
          response = await fetch('/api/v1/directory', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: args[0],
            }),
          });
          break;

        case 'MOVE':
          if (!args[0] || !args[1]) {
            setError(ERROR_MESSAGES.MISSING_PATHS);
            return;
          }
          response = await fetch('/api/v1/directory', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: args[0],
              destPath: args[1],
            }),
          });
          break;

        case 'DELETE':
          if (!args[0]) {
            setError(ERROR_MESSAGES.INVALID_PATH);
            return;
          }
          response = await fetch(`/api/v1/directory?path=${encodeURIComponent(args[0])}`, {
            method: 'DELETE',
          });
          break;

        default:
          setError(ERROR_MESSAGES.INVALID_COMMAND);
          return;
      }

      const data: DirectoryResponse = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || ERROR_MESSAGES.FAILED_CREATE;
        setError(errorMessage);

        // Display error in output for client errors (4xx)
        if (
          response.status >= HTTP_STATUS.BAD_REQUEST &&
          response.status < HTTP_STATUS.SERVER_ERROR
        ) {
          setOutput((prev) => prev + formatOutput(command, errorMessage));
        }
        return;
      }

      setOutput(
        (prev) => prev + formatOutput(command, data.structure ? '\n' + data.structure : '')
      );
    } catch (err) {
      console.error('Command processing error:', err);
      setError(ERROR_MESSAGES.PROCESSING_ERROR);
    }

    setCommand('');
  };

  return (
    <div className="space-y-4 h-[600px] flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/5
                     text-white border border-white/20
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     font-mono placeholder-white/50"
          placeholder="Enter command (CREATE, MOVE, DELETE, LIST)"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
      <pre
        ref={outputRef}
        className="flex-1 bg-black/20 p-4 rounded-lg
                     text-white font-mono whitespace-pre-wrap
                     border border-white/10
                     overflow-y-auto scroll-smooth"
      >
        {output || 'Output will appear here...'}
      </pre>
    </div>
  );
}
