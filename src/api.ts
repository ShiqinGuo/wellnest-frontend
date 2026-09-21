export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
const requestTimeoutMs = 60_000;
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
  operationKey?: string,
): Promise<T> {
  const response = await fetch(
    `${import.meta.env.VITE_API_ORIGIN || ""}${path}`,
    {
      signal: AbortSignal.timeout(requestTimeoutMs),
      method,
      credentials: "include",
      headers:
        body === undefined
          ? {}
          : {
              "Content-Type": "application/json",
              ...(operationKey ? { "Idempotency-Key": operationKey } : {}),
            },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  ).catch(() => {
    throw new ApiError("NETWORK", "连接中断，请重试刚才的操作。");
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(
      "SERVICE_UNAVAILABLE",
      "服务暂时繁忙，刚才的操作可能尚未完成。请重试，我们会避免重复处理。",
    );
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      data.error?.code || "NETWORK",
      data.error?.message || "暂时无法连接，请重试",
    );
  return data;
}
