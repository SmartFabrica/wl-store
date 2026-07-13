import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { APIResponse, HTTPStatus, UserRole, UserStatus } from "../types/common.types";
import { AppError } from "../utils/app-error";
import dbPool from "../config/db";
import UserModel from "../models/user.model";
import { v4 as uuidv4 } from "uuid";
import { comparePassword, hashPassword } from "../utils/password";
import { UserAggregate } from "../types/db.types";
import { generateToken } from "../utils/jwt";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { role, email, password, company_name, phone, address, tax_number, tax_office, first_name, last_name } = req.body;

  if (role !== UserRole.CORPORATE && role !== UserRole.INDIVIDUAL) {
    throw new AppError("Geçersiz kullanıcı rolü", HTTPStatus.BAD_REQUEST);
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    const existingUser = await UserModel.findByEmail(client, email);
    if (existingUser) {
      throw new AppError("Bu eposta adresine ait kullanıcı sistemde bulunmaktadır.", HTTPStatus.NOT_FOUND);
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const passwordHash = await hashPassword(password);

    const savedUser = await UserModel.createUser(client, {
      id: userId,
      email,
      password_hash: passwordHash,
      role,
      status: UserStatus.PENDING,
    });

    let clientResponseData: UserAggregate;

    if (role === UserRole.CORPORATE) {
      if (!company_name || !phone) {
        throw new AppError("Kurumsal profil için şirket adı ve telefon zorunludur.", HTTPStatus.BAD_REQUEST);
      }

      const savedCorporateProfile = await UserModel.createCorporateProfile(client, {
        id: profileId,
        user_id: userId,
        address,
        company_name,
        phone,
        tax_number,
        tax_office,
      });

      clientResponseData = {
        ...savedUser,
        profile: {
          company_name: savedCorporateProfile.company_name,
          tax_number: savedCorporateProfile.tax_number,
          tax_office: savedCorporateProfile.tax_office,
          phone: savedCorporateProfile.phone,
          address: savedCorporateProfile.address,
        },
      };
    } else {
      if (!first_name || !last_name) {
        throw new AppError("Bireysel profil için ad ve soyad zorunludur.", HTTPStatus.BAD_REQUEST);
      }

      const savedIndividualProfile = await UserModel.createIndividualProfile(client, {
        id: profileId,
        user_id: userId,
        first_name,
        last_name,
        phone,
      });

      clientResponseData = {
        ...savedUser,
        profile: {
          first_name: savedIndividualProfile.first_name,
          last_name: savedIndividualProfile.last_name,
          phone: savedIndividualProfile.phone,
        },
      };
    }

    await client.query("COMMIT");
    const response: APIResponse<UserAggregate> = {
      success: true,
      message: "Kullanıcı kayıt başvurusu başarıyla alındı. Onay bekleniyor",
      data: clientResponseData,
    };

    return res.status(HTTPStatus.CREATED).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("E-posta ve şifre alanları zorunludur.", HTTPStatus.BAD_REQUEST);
  }

  const user = await UserModel.findByEmail(dbPool, email);

  if (!user) {
    throw new AppError("Giriş bilgileri hatalı veya geçersiz.", HTTPStatus.UNAUTHORIZED);
  }

  if (user.status === UserStatus.PENDING) {
    throw new AppError("Hesabınız henüz admin tarafından onaylanmamıştır. Lütfen bekleyiniz.", 403);
  }

  if (user.status === UserStatus.REJECTED) {
    throw new AppError("Hesap başvurunuz reddedilmiştir. Detaylı bilgi için destek ile iletişime geçin.", 403);
  }

  const isPasswordMatch = await comparePassword(password, user.password_hash);
  if (!isPasswordMatch) {
    throw new AppError("Giriş bilgileri hatalı veya geçersiz.", HTTPStatus.UNAUTHORIZED);
  }

  const token = generateToken({
    role: user.role,
    userId: user.id,
  });

  const response: APIResponse<{ token: string; user: UserAggregate }> = {
    success: true,
    message: "Giriş işlemi başarıyla gerçekleştirildi.",
    data: {
      token,
      user,
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});
