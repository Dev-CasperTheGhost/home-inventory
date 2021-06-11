import { Router } from "express";
import { withAuth } from "@hooks/withAuth";
import { createProductSchema } from "@schemas/products.schema";
import { IRequest } from "@t/IRequest";
import { createYupSchema } from "@utils/createYupSchema";
import { prisma } from "src/index";

const router = Router();

/**
 * return all the projects inside the database
 */
router.get("/", withAuth, async (_, res) => {
  const products = await prisma.product.findMany();

  return res.json({ products });
});

router.get("/:id", withAuth, async (req, res) => {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        error: "Product was not found",
        status: "error",
      });
    }

    return res.json({ product });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

/**
 * create a new product
 */
router.post("/", withAuth, async (req: IRequest, res) => {
  try {
    const body = req.body;

    const schema = createYupSchema(createProductSchema);
    const error = await schema
      .validate(body)
      .then(() => null)
      .catch((e) => e);

    if (error) {
      return res.status(400).json({
        error: error.message,
        status: "error",
      });
    }

    const existing = await prisma.product.findUnique({ where: { name: body.name } });

    /**
     * if there's already a product with the same name,
     * update the existing product with the new quantity
     * and append to price to the prices array
     */
    if (existing) {
      await prisma.product.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: existing.quantity + body.quantity,

          // body.price = for 1 item, times the quantity -> total amount for the product.
          prices: [...(existing.prices ?? []), body.price * body.quantity],
        },
      });

      const products = await prisma.product.findMany();
      return res.json({ products });
    }

    let category;
    if (body.categoryId) {
      category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return res.status(404).json({
          error: "That category was not found",
          status: "error",
        });
      }
    }

    await prisma.user.update({
      where: {
        id: req.userId!,
      },
      data: {
        products: {
          create: {
            name: body.name,
            quantity: body.quantity,
            price: body.price,
            // body.price = for 1 item, times the quantity -> total amount for the product.
            prices: [body.price * body.quantity],
            expirationDate: body.expirationDate || "N/A",
            categoryId: category?.id ?? null,
          },
        },
      },
    });

    const products = await prisma.product.findMany();

    return res.json({ products });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

router.put("/:id", withAuth, async (req, res) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const schema = createYupSchema(createProductSchema);
    const error = await schema
      .validate(body)
      .then(() => null)
      .catch((e) => e);

    if (error) {
      return res.status(400).json({
        error: error.message,
        status: "error",
      });
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({
        error: "Product was not found",
        status: "error",
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        expirationDate: body.expirationDate || "N/A",
      },
    });

    const products = await prisma.product.findMany();

    return res.json({ products });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

router.delete("/:id", withAuth, async (req, res) => {
  try {
    const id = req.params.id as string;

    await prisma.product.delete({ where: { id } });

    const products = await prisma.product.findMany();

    return res.json({ products });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

export const productsRouter = router;
