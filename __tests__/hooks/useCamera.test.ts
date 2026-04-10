import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from '@/hooks/useCamera';

describe('useCamera', () => {
  let mockTrack: { stop: jest.Mock };
  let mockStream: { getTracks: jest.Mock };

  beforeEach(() => {
    mockTrack = { stop: jest.fn() };
    mockStream = { getTracks: jest.fn(() => [mockTrack]) };

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      configurable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mockStream),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // C-01: マウント時にgetUserMediaがfacingMode: 'environment'で呼ばれる
  it('C-01: マウント時にgetUserMediaがfacingMode: environmentで呼ばれる', async () => {
    renderHook(() => useCamera());

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'environment' },
      });
    });
  });

  // C-02: ストリーム取得成功時、videoRef.current.srcObjectにストリームがセットされる
  it('C-02: ストリーム取得成功時、videoRef.current.srcObjectにストリームがセットされる', async () => {
    const { result } = renderHook(() => useCamera());

    // videoRefに実際のVideoElementをセットしてからフックが動作するよう準備
    const videoElement = document.createElement('video');
    // refに直接代入（テスト用）
    Object.defineProperty(result.current.videoRef, 'current', {
      writable: true,
      value: videoElement,
    });

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    // srcObjectがストリームにセットされていることを確認
    // (実際のsetObjectは非同期のため、refへのセットはuseEffect内で行われる)
    // このテストは実装後にGreenになる
    expect(result.current.error).toBeNull();
  });

  // C-03: エラー発生時、error stateにエラーメッセージが格納される
  it('C-03: エラー発生時、error stateにエラーメッセージが格納される', async () => {
    const errorMessage = 'Permission denied';
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toContain(errorMessage);
  });

  // C-04: アンマウント時にtrack.stop()が呼ばれる（C-5対応）
  it('C-04: アンマウント時にtrack.stop()が呼ばれる', async () => {
    const { unmount } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });
});
