type QueryValue = string | number | null | undefined;

export function withQuery(path: string, params: URLSearchParams | Record<string, QueryValue>): string {
  const search =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(
          Object.entries(params).flatMap(([key, value]) =>
            value === null || value === undefined || value === "" ? [] : [[key, String(value)]],
          ),
        );
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
