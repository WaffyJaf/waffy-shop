import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const AddCart = async (req: Request, res: Response) => {
  console.log('AddCart endpoint called with:', req.body);
  const userId = Number(req.body.userId);
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity);

  if (!userId || !productId || !quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง' });
  }

  try {
    const product = await prisma.products.findUnique({
      where: { id_products: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }

    const existingCartItem = await prisma.cart_items.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      cartItem = await prisma.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await prisma.cart_items.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity: quantity,
        },
      });
    }

    return res.status(200).json({ message: 'เพิ่มสินค้าลงตะกร้าแล้ว', cartItem });
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มลงตะกร้า' });
  }
};

export const getCart = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({ message: 'ต้องระบุ user_id' });
  }

  try {
    const cartItems = await prisma.cart_items.findMany({
      where: { user_id: userId },
      include: {
        products: {
          select: {
            id_products: true,
            name: true,
            price: true,
            image_url: true,
            stock: true,
          },
        },
      },
    });

    const formattedItems = cartItems.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: {
        id_products: item.products.id_products,
        name: item.products.name,
        price: item.products.price,
        image_url: item.products.image_url,
        stock: item.products.stock,
      },
    }));

    return res.status(200).json(formattedItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้า' });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  const itemId = req.params.itemId;
  const quantity = Number(req.body.quantity);

  if (!itemId || !quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง' });
  }

  try {
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: itemId },
      include: { products: { select: { stock: true } } },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'ไม่พบรายการในตะกร้า' });
    }

    const updatedItem = await prisma.cart_items.update({
      where: { id: itemId },
      data: {
        quantity,
        updated_at: new Date(),
      },
    });

    return res.status(200).json({ message: 'อัปเดตจำนวนสินค้าแล้ว', cartItem: updatedItem });
  } catch (err) {
    console.error('Error updating cart item:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตจำนวนสินค้า' });
  }
};

export const RemoveCart = async (req: Request, res: Response) => {
  const itemId = req.params.itemId;

  try {
    const cartItem = await prisma.cart_items.findUnique({
      where: { id: itemId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'ไม่พบรายการในตะกร้า' });
    }

    await prisma.cart_items.delete({
      where: { id: itemId },
    });

    return res.status(200).json({ message: 'ลบสินค้าออกจากตะกร้าแล้ว' });
  } catch (err) {
    console.error('Error removing cart item:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า' });
  }
};