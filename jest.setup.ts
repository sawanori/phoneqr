import '@testing-library/jest-dom';

// getUserMedia モック（I-4対応）
const mockTrack = { stop: jest.fn(), kind: 'video' };
const mockStream = { getTracks: jest.fn(() => [mockTrack]) };

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  configurable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockStream),
  },
});

// HTMLMediaElement.play() モック
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  configurable: true,
  value: jest.fn().mockResolvedValue(undefined),
});
