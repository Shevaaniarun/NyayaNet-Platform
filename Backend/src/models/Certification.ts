import pool from '../config/database';
import { CreateCertificationInput, CertificationResponse } from '../types/profileTypes';

export class CertificationModel {
    static async findByUserId(userId: string): Promise<CertificationResponse[]> {
        const result = await pool.query(
            `SELECT id, title, issuing_organization, credential_id, issue_date, expiry_date, certificate_url, file_type, description, tags
       FROM user_certifications WHERE user_id = $1 ORDER BY issue_date DESC;`,
            [userId]
        );
        return result.rows.map((row: any) => ({
            id: row.id, title: row.title, issuingOrganization: row.issuing_organization,
            credentialId: row.credential_id, issueDate: row.issue_date.toISOString().split('T')[0],
            expiryDate: row.expiry_date?.toISOString().split('T')[0], certificateUrl: row.certificate_url,
            fileType: row.file_type, description: row.description, tags: row.tags || []
        }));
    }

    static async create(userId: string, certData: CreateCertificationInput): Promise<CertificationResponse> {
        const result = await pool.query(
            `INSERT INTO user_certifications (user_id, title, issuing_organization, credential_id, issue_date, expiry_date, certificate_url, file_type, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`,
            [userId, certData.title, certData.issuingOrganization, certData.credentialId, certData.issueDate,
                certData.expiryDate, certData.certificateUrl, certData.fileType, certData.description, certData.tags || []]
        );
        const row = result.rows[0];
        return {
            id: row.id, title: row.title, issuingOrganization: row.issuing_organization,
            credentialId: row.credential_id, issueDate: row.issue_date.toISOString().split('T')[0],
            expiryDate: row.expiry_date?.toISOString().split('T')[0], certificateUrl: row.certificate_url,
            fileType: row.file_type, description: row.description, tags: row.tags || []
        };
    }

    static async delete(certificationId: string, userId: string): Promise<boolean> {
        const result = await pool.query(`DELETE FROM user_certifications WHERE id = $1 AND user_id = $2;`, [certificationId, userId]);
        return (result.rowCount ?? 0) > 0;
    }
}
