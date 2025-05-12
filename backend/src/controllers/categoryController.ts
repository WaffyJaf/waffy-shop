import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'กรุณาระบุชื่อหมวดหมู่' });

  try {
    const newCategory = await prisma.categories.create({ data: { name } });
    res.status(201).json({ message: 'เพิ่มหมวดหมู่สำเร็จ', category: newCategory });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่' });
  }
};


export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        name: 'asc', // จัดเรียงตามชื่อ
      },
      select: {
        id_categories: true,
        name: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
      data: categories,
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', err);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่',
      error: err instanceof Error ? err.message : err,
    });
  }
};


export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.categories.delete({ where: { id_categories: Number(id) } });
    res.status(200).json({ message: 'ลบหมวดหมู่เรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถลบหมวดหมู่ได้' });
  }
};


