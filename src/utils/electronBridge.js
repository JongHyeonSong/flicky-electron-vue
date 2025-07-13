// window.electronAPI의 메서드를 안전하게 호출하는 유틸 함수
export function electronBridge(eventName, data) {
  // Vue Proxy 객체 방지: plain object로 변환
  const plainData = data ? JSON.parse(JSON.stringify(data)) : undefined;
  if (
    window.electronAPI &&
    typeof window.electronAPI[eventName] === "function"
  ) {
    // 3초 타임아웃 추가
    return Promise.race([
      window.electronAPI[eventName](plainData),
      new Promise((_, reject) =>
        setTimeout(() => {
          console.warn(`[electronBridge] <<${eventName}>> 요청 타임아웃 (3초)`);
          reject(new Error("요청 타임아웃 (3초)"));
        }, 3000)
      ),
    ]);
  } else {
    return Promise.reject(
      new Error(`window.electronAPI.${eventName} is not available`)
    );
  }
}
