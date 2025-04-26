import { useState } from "react";
import { toast } from "sonner";

function useFetch<T>(cb: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(...args);
      setData(response);
      return response;
    } catch (error: any) {
      setError(error);
      toast.error(error.message || "An error occurred");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}

export default useFetch;
