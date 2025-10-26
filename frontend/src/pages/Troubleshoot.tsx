import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Troubleshoot() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllIssues = async () => {
      try {
        const { data, error } = await supabase.rpc('get_issues_with_reporters');
        if (error) throw error;
        setIssues(data || []);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllIssues();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Troubleshooting</h1>
      <pre>{JSON.stringify(issues, null, 2)}</pre>
    </div>
  );
}
