import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';

export default function usePostRequest(url: string, data: any): any | null {
  const [response, setResponse] = useState<AxiosResponse<any, any> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!loading) {
        setLoading(true);
        const res = await axios.post(url, data);
        const json = await res;
        setResponse(json);
        setLoading(false);
      }
    };
    fetchData();
    return () => {};
  }, []);
  return response;
}
