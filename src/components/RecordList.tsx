import { useState, useEffect } from 'react';
import RecordsService from '../services/RecordsService';

interface UseRecordsConversionOptions {
  semester: string;
  autoLoad?: boolean;
}

export const useRecordsConversion = ({
  semester,
  autoLoad = true,
}: UseRecordsConversionOptions) => {
  const [records, setRecords] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recordsData = await RecordsService.getRecordsBySemester(semester);
      setRecords(recordsData);
    } catch (err: any) {
      console.error('[useRecordsConversion] loadData error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecord = async (recordId: number, data: any) => {
    try {
      await RecordsService.updateRecord(recordId, data);
      await loadData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (autoLoad && semester) {
      loadData();
    }
  }, [semester, autoLoad]);

  return {
    records,
    isLoading,
    error,
    loadData,
    updateRecord,
  };
};