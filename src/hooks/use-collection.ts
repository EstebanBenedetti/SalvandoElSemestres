"use client";

import { useCallback, useEffect, useState } from "react";

interface CollectionResponse<T> { success: boolean; data: { data: T[] } | T; error?: string; }

export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/data/${collectionName}`);
      const body = await response.json() as CollectionResponse<T>;
      if (!response.ok || !body.success) throw new Error(body.error ?? "No se pudo cargar la colección");
      const result = body.data as { data: T[] };
      setData(Array.isArray(result.data) ? result.data : [body.data as T]);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Error desconocido");
    } finally { setIsLoading(false); }
  }, [collectionName]);
  useEffect(() => {
    let active = true;
    void fetch(`/api/data/${collectionName}`)
      .then((response) => response.json() as Promise<CollectionResponse<T>>)
      .then((body) => {
        if (!active) return;
        const result = body.data as { data: T[] };
        setData(Array.isArray(result.data) ? result.data : [body.data as T]);
        setError(body.success ? null : body.error ?? "No se pudo cargar la colección");
      })
      .catch(() => { if (active) setError("Error desconocido"); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [collectionName]);
  return { data, isLoading, error, refetch };
}
