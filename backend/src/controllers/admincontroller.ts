import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

export type UserRole = 'ADMIN' | 'USER' ;

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    const validRoles: UserRole[] = ['ADMIN', 'USER'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { role },
    });

    return res.status(200).json({
      message: 'Role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserData = async(req:Request , res:Response) =>{
  try{
    const user = await prisma.user.findMany({
      select:{
        user_id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return res.status(500).json({
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;  
  
  if (!user_id) {
    return res.status(400).json({ message: "ไม่มี ID ผู้ใช้" });
  }

  try {
    const existingEvent = await prisma.user.findUnique({
      where: { user_id: Number(user_id) },  
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการลบ" });
    }

    
    await prisma.user.delete({
      where: { user_id: Number(user_id) },
    });

    return res.status(200).json({ message: "ลบผู้ใช้เรียบร้อย" });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบผู้ใช่:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบผู้ใช้", error });
  }
};

