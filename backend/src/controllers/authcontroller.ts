import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
export default prisma;

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    
    const existingUsername = await prisma.user.findFirst({
      where: { name },
    });

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER', // กำหนด role เริ่มต้น
      },
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // ค้นหาผู้ใช้
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // ตรวจสอบรหัสผ่านที่เข้ารหัส
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // ตรวจสอบว่า JWT_SECRET ถูกกำหนดหรือไม่
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET is not defined in the environment variables' });
  }

  // สร้าง JWT Token
  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    secret,
    { expiresIn: '1h' }
  );

  // ส่งข้อมูลทั้ง token และ user กลับไป
  res.json({
    message: 'Login successful',
    token,
    user: {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role, // ส่งข้อมูล role ของ user
    },
  });
};

