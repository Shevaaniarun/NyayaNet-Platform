import pool from '../config/database';

export interface LawAct {
  id: string;
  act_name: string;
  act_year: number;
  short_title: string;
  category: string;
  preamble?: string;
  section_count: number;
}

export interface LawSection {
  id: string;
  section_number: string;
  section_title: string;
  section_text: string;
  explanation?: string;
  act_id: string;
  act_name: string;
}

export interface LawSearchFilters {
  q?: string;
  category?: string;
  act_id?: string;
  page?: number;
  limit?: number;
}

export class LawLibraryService {
  
  // Get all acts with section counts
  static async getAllActs(filters?: LawSearchFilters): Promise<{ acts: LawAct[]; total: number }> {
    const { category, page = 1, limit = 20 } = filters || {};
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      whereClause = `WHERE category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) FROM law_acts ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    const query = `
      SELECT 
        a.*,
        COUNT(s.id) as section_count
      FROM law_acts a
      LEFT JOIN law_sections s ON a.id = s.act_id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.act_name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await pool.query(query, [...params, limit, offset]);
    
    return {
      acts: result.rows,
      total
    };
  }
  
  // Get single act with its sections
  static async getActById(actId: string): Promise<any> {
    const actQuery = `
      SELECT * FROM law_acts WHERE id = $1
    `;
    const actResult = await pool.query(actQuery, [actId]);
    
    if (actResult.rows.length === 0) {
      return null;
    }
    
    const sectionsQuery = `
      SELECT * FROM law_sections 
      WHERE act_id = $1 
      ORDER BY 
        -- Natural sort: handle section numbers like "1", "1A", "2"
        CAST(NULLIF(regexp_replace(section_number, '[^0-9]', '', 'g'), '') AS INTEGER),
        section_number
    `;
    const sectionsResult = await pool.query(sectionsQuery, [actId]);
    
    return {
      ...actResult.rows[0],
      sections: sectionsResult.rows
    };
  }
  
  // Get single section
  static async getSectionById(sectionId: string): Promise<any> {
    const query = `
      SELECT 
        s.*,
        a.act_name,
        a.act_year,
        a.short_title
      FROM law_sections s
      JOIN law_acts a ON s.act_id = a.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [sectionId]);
    return result.rows[0] || null;
  }
  
  // Search laws
  static async searchLaws(filters: LawSearchFilters): Promise<{ results: any[]; total: number }> {
    const { q, category, act_id, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (q) {
      whereConditions.push(`(
        s.section_text ILIKE $${paramIndex} OR
        s.section_title ILIKE $${paramIndex} OR
        s.explanation ILIKE $${paramIndex} OR
        a.act_name ILIKE $${paramIndex}
      )`);
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    if (category) {
      whereConditions.push(`a.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    if (act_id) {
      whereConditions.push(`s.act_id = $${paramIndex}`);
      params.push(act_id);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    const countQuery = `
      SELECT COUNT(*) 
      FROM law_sections s
      JOIN law_acts a ON s.act_id = a.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    const query = `
      SELECT 
        s.id,
        s.section_number,
        s.section_title,
        s.section_text,
        s.explanation,
        a.id as act_id,
        a.act_name,
        a.act_year,
        a.short_title,
        ts_rank(to_tsvector('english', s.section_text || ' ' || COALESCE(s.explanation, '')), plainto_tsquery('english', $1)) as rank
      FROM law_sections s
      JOIN law_acts a ON s.act_id = a.id
      ${whereClause}
      ORDER BY 
        CASE WHEN $1 IS NOT NULL THEN rank END DESC,
        s.section_number
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await pool.query(query, [...params, limit, offset]);
    
    return {
      results: result.rows,
      total
    };
  }
  
  // Bookmark a section
  static async toggleBookmark(userId: string, sectionId: string): Promise<{ bookmarked: boolean }> {
    const checkQuery = `
      SELECT id FROM law_bookmarks 
      WHERE user_id = $1 AND section_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, sectionId]);
    
    if (checkResult.rows.length > 0) {
      await pool.query(
        'DELETE FROM law_bookmarks WHERE user_id = $1 AND section_id = $2',
        [userId, sectionId]
      );
      return { bookmarked: false };
    } else {
      await pool.query(
        'INSERT INTO law_bookmarks (user_id, section_id) VALUES ($1, $2)',
        [userId, sectionId]
      );
      return { bookmarked: true };
    }
  }
  
  // Get user's bookmarks
  static async getUserBookmarks(userId: string): Promise<any[]> {
    const query = `
      SELECT 
        b.*,
        s.section_number,
        s.section_title,
        a.act_name,
        a.act_year
      FROM law_bookmarks b
      JOIN law_sections s ON b.section_id = s.id
      JOIN law_acts a ON s.act_id = a.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}