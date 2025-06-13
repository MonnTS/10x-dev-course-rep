import { type SupabaseClient } from '@/db/supabase.client';
import type { ErrorLog } from './error-log.model';

export class ErrorLogService {
  private readonly supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async logError(error: Error, userId: string): Promise<ErrorLog> {
    try {
      const { data } = await this.supabase
        .from('error_logs')
        .insert({
          user_id: userId,
          error_message: error.message,
          error_time: new Date().toISOString(),
        })
        .select()
        .single();

      return data as ErrorLog;
    } catch (e) {
      throw new Error(`Failed to log error: ${e}`);
    }
  }

  async listErrors(
    params: {
      page?: number;
      limit?: number;
      userId?: string;
    } = {}
  ): Promise<{
    data: ErrorLog[];
    total: number;
  }> {
    const { page = 1, limit = 10, userId } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('error_time', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, count, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      throw new Error(`Failed to list error logs: ${error.message}`);
    }

    return {
      data: (data || []) as ErrorLog[],
      total: count || 0,
    };
  }
}
