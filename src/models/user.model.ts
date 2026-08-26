import { Pool, PoolClient } from "pg";
import { CorporateProfileRow, IndividualProfileRow, UserAggregate, UserRow } from "../types/db.types";
import { UserStatus } from "../types/common.types";

type CreateUserDTO = Omit<UserRow, "created_at" | "updated_at">;
type CreateCorporateProfileDto = Omit<CorporateProfileRow, "created_at" | "updated_at">;
type CreateIndividualProfileDto = Omit<IndividualProfileRow, "created_at" | "updated_at">;

interface UpdateUserStatusDTO {
  id: string;
  status: UserStatus;
}

const UserModel = {
  createUser: async (client: PoolClient, dto: CreateUserDTO): Promise<UserRow> => {
    const sql = `INSERT INTO users (id, email, password_hash, role, status) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;

    const values = [dto.id, dto.email, dto.password_hash, dto.role, dto.status];

    const result = await client.query(sql, values);
    return result.rows[0];
  },

  createCorporateProfile: async (client: PoolClient, dto: CreateCorporateProfileDto): Promise<CorporateProfileRow> => {
    const sql = `INSERT INTO corporate_profiles (id, user_id, company_name, tax_number, tax_office, phone, address)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `;

    const values = [dto.id, dto.user_id, dto.company_name, dto.tax_number, dto.tax_office, dto.phone, dto.address];

    const result = await client.query(sql, values);
    return result.rows[0];
  },

  createIndividualProfile: async (client: PoolClient, dto: CreateIndividualProfileDto): Promise<IndividualProfileRow> => {
    const sql = `INSERT INTO individual_profiles (id, user_id, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `;

    const values = [dto.id, dto.user_id, dto.first_name, dto.last_name, dto.phone];

    const result = await client.query(sql, values);
    return result.rows[0];
  },

  findByEmail: async (client: PoolClient | Pool, email: string): Promise<UserAggregate | null> => {
    const sql = `
      SELECT 
        u.id, 
        u.email, 
        u.password_hash, 
        u.role, 
        u.status, 
        u.created_at,
        u.updated_at,
        CASE 
          WHEN u.role = 'corporate' THEN 
            json_build_object(
              'company_name', cp.company_name,
              'tax_number', cp.tax_number,
              'tax_office', cp.tax_office,
              'phone_number', cp.phone,
              'address', cp.address
            )
          WHEN u.role = 'individual' THEN 
            json_build_object(
              'first_name', ip.first_name,
              'last_name', ip.last_name,
              'phone_number', ip.phone
            )
          ELSE null
        END as profile
      FROM users u
      LEFT JOIN corporate_profiles cp ON u.id = cp.user_id
      LEFT JOIN individual_profiles ip ON u.id = ip.user_id
      WHERE u.email = $1
      LIMIT 1
    `;
    const values = [email];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  findById: async (client: PoolClient | Pool, id: string): Promise<UserRow | null> => {
    const sql = `SELECT * FROM users WHERE id = $1 LIMIT 1`;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getDetailById: async (client: PoolClient | Pool, id: string): Promise<UserAggregate | null> => {
    const sql = `
      SELECT 
        u.id, 
        u.email, 
        u.password_hash, 
        u.role, 
        u.status, 
        u.created_at,
        u.updated_at,
        CASE 
          WHEN u.role = 'corporate' THEN 
            json_build_object(
              'company_name', cp.company_name,
              'tax_number', cp.tax_number,
              'tax_office', cp.tax_office,
              'phone_number', cp.phone,
              'address', cp.address
            )
          WHEN u.role = 'individual' THEN 
            json_build_object(
              'first_name', ip.first_name,
              'last_name', ip.last_name,
              'phone_number', ip.phone
            )
          ELSE null
        END as profile
      FROM users u
      LEFT JOIN corporate_profiles cp ON u.id = cp.user_id
      LEFT JOIN individual_profiles ip ON u.id = ip.user_id
      WHERE u.id = $1
      LIMIT 1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAllUsers: async (client: PoolClient | Pool): Promise<UserAggregate[]> => {
    const sql = `
      SELECT 
        u.id, u.email, u.role, u.status, u.created_at, u.updated_at,
        CASE 
          WHEN u.role = 'corporate' THEN 
            json_build_object(
              'company_name', cp.company_name,
              'tax_number', cp.tax_number,
              'tax_office', cp.tax_office,
              'phone_number', cp.phone,
              'address', cp.address
            )
          WHEN u.role = 'individual' THEN 
            json_build_object(
              'first_name', ip.first_name,
              'last_name', ip.last_name,
              'phone_number', ip.phone
            )
          ELSE null
        END as profile
      FROM public.users u
      LEFT JOIN public.corporate_profiles cp ON u.id = cp.user_id
      LEFT JOIN public.individual_profiles ip ON u.id = ip.user_id
      ORDER BY u.created_at DESC    
    `;

    const result = await client.query(sql);
    return result.rows;
  },

  updateUserStatus: async (client: Pool | PoolClient, dto: UpdateUserStatusDTO): Promise<UserRow> => {
    const sql = `
      UPDATE users 
      SET 
        status = $2 
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.status];
    const result = await client.query(sql, values);
    return result.rows[0];
  },
};

export default UserModel;
