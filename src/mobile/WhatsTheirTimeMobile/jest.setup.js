// This file contains any global setup for Jest tests

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({}));

// Mock the Date object for consistent testing
const mockDate = new Date('2025-04-12T12:00:00Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      return mockDate;
    }
    return super(...args);
  }
}
global.Date.now = jest.fn(() => mockDate.getTime());

// Silence console errors/warnings during tests
console.error = jest.fn();
console.warn = jest.fn();