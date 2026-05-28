// Suppress recharts duplicate key warnings
// These are internal recharts library warnings that don't affect functionality
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Filter out recharts duplicate key warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Encountered two children with the same key') ||
     args[0].includes('Keys should be unique'))
  ) {
    return;
  }

  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  // Filter out recharts duplicate key warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Encountered two children with the same key') ||
     args[0].includes('Keys should be unique'))
  ) {
    return;
  }

  // Pass through all other warnings
  originalConsoleWarn.apply(console, args);
};

export {};
