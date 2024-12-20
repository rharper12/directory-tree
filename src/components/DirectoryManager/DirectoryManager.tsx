'use client';

import { useState } from 'react';

export default function DirectoryManager() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatOutput = (command: string, response: string): string => {
    const parts = command.split(' ');
    const formattedCommand = `> ${parts[0].toUpperCase()}${parts.length > 1 ? ' ' + parts.slice(1).join(' ') : ''}`;

    const spacing = output ? '\n\n' : '';

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

      const response = await fetch('/api/v1/directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cmd,
          path: args[0],
          destPath: args[1],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        // Only add error message to output if it's a specific error message
        if (data.error && data.error.startsWith('Cannot delete')) {
          setOutput((prev) => prev + formatOutput(command, '\n' + data.error));
        }
        return;
      }

      setOutput(
        (prev) => prev + formatOutput(command, data.structure ? '\n' + data.structure : '')
      );
    } catch (err) {
      console.error('Command processing error:', err);
      setError('An error occurred processing your command');
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
        className="flex-1 bg-black/20 p-4 rounded-lg
                     text-white font-mono whitespace-pre-wrap
                     border border-white/10
                     overflow-y-auto"
      >
        {output || 'Output will appear here...'}
      </pre>
    </div>
  );
}
