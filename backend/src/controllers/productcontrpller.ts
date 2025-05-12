import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from "path";
import multer from "multer";

const prisma = new PrismaClient();
export default prisma;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join('D:/NPM I/backend/uploads')); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); 
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // จำกัดขนาดไฟล์ไม่เกิน 5MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
  
      if (extname && mimetype) {
        return cb(null, true); // อนุญาตให้ไฟล์ที่เป็นภาพ
      } else {
        return cb(new Error("Only image files are allowed!")); // ถ้าไม่ใช่ไฟล์ภาพจะให้เกิดข้อผิดพลาด
      }
    },
  }).single("image"); 

export const uploadImage = (req: Request, res: Response) => {
    upload(req, res, (err) => {
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message }); 
      }
      console.log("File received:", req.file);
  
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // สร้าง URL ของไฟล์ที่อัปโหลด
      return res.status(200).json({ imageUrl }); // ส่ง URL ของไฟล์กลับไป
    });

}



export const AddProducts = async (req: Request, res: Response) => {
  const { name, description, price, stock, image_url, category_id } = req.body;


  if (!name || !description || !image_url) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน: ชื่อ, รายละเอียด, และรูปภาพต้องไม่ว่างเปล่า" });
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(stock);
  const parsedCategoryId = Number(category_id);

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ success: false, message: "ราคาต้องเป็นตัวเลขและมากกว่า 0" });
  }
  if (isNaN(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ success: false, message: "จำนวนในคลังต้องเป็นตัวเลขและไม่น้อยกว่า 0" });
  }
  if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
    return res.status(400).json({ success: false, message: "หมวดหมู่ไม่ถูกต้อง" });
  }

  try {
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        price: parsedPrice,
        stock: parsedStock,
        image_url,
        category_id: parsedCategoryId,
      },
    });
    console.log("save to database successfully");
   return res.status(201).json({
  success: true,
  message: "เพิ่มสินค้าสำเร็จ",
  data: newProduct
});
  } catch (error) {
    console.error("!!! Error save to database !!!!", error);
    return res.status(500).json({ success: false, message: "บันทึกข้อมูลไม่สำเร็จ", error });
  }
};


