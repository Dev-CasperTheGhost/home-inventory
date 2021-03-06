import { Router } from "express";
import { withAuth } from "@hooks/withAuth";
import { withValidHouseId } from "@hooks/withValidHouseId";
import { IRequest } from "@t/IRequest";
import { prisma } from "@lib/prisma";

const router = Router();

async function getShoppingList(houseId: string | undefined) {
  const data = await prisma.house.findUnique({
    where: {
      id: houseId,
    },
    include: {
      shoppingList: {
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  return data?.shoppingList ?? null;
}

router.get("/:houseId", withAuth, withValidHouseId, async (req: IRequest, res) => {
  const shoppingList = await getShoppingList(req.params.houseId!);

  return res.json({ shoppingList });
});

router.post("/:houseId", withAuth, withValidHouseId, async (req: IRequest, res) => {
  try {
    const body = req.body;

    if (!body.productId) {
      return res.status(400).json({
        error: "Product must be provided",
      });
    }

    const shoppingList = await getShoppingList(req.params.houseId!);
    let shoppingListId: string;

    if (!shoppingList) {
      const list = await prisma.shoppingList.create({
        data: {},
      });

      shoppingListId = list.id;

      await prisma.house.update({
        where: { id: req.params.houseId! },
        data: {
          shoppingList: {
            connect: { id: list.id },
          },
        },
      });
    } else {
      shoppingListId = shoppingList.id;
    }

    const existing = await prisma.shoppingListItem.findFirst({
      where: {
        productId: body.productId,
      },
    });

    if (existing) {
      return res.status(400).json({
        error: "Product is already in the shopping list",
        status: "error",
      });
    }

    const productItem = await prisma.shoppingListItem.create({
      data: {
        productId: body.productId,
        shoppingListId,
      },
    });

    await prisma.shoppingList.update({
      where: {
        id: shoppingListId,
      },
      data: {
        products: {
          connect: {
            id: productItem.id,
          },
        },
      },
    });

    const updatedList = await getShoppingList(req.params.houseId!);

    return res.json({ shoppingList: updatedList });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

router.put("/:houseId/:id", withAuth, withValidHouseId, async (req: IRequest, res) => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const item = await prisma.shoppingListItem.findUnique({ where: { id } });

    if (!item) {
      return res.status(404).json({
        error: "item was not found",
        status: "error",
      });
    }

    await prisma.shoppingListItem.update({
      where: {
        id,
      },
      data: {
        completed: body.completed,
      },
    });

    const shoppingList = await getShoppingList(req.params.houseId);

    return res.json({ shoppingList });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

router.delete("/:houseId/:id", withAuth, withValidHouseId, async (req: IRequest, res) => {
  try {
    const id = req.params.id as string;

    await prisma.shoppingListItem.delete({
      where: {
        id,
      },
    });

    const shoppingList = await getShoppingList(req.params.houseId);

    return res.json({ shoppingList });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      error: "An unexpected error has occurred. Please try again later",
      status: "error",
    });
  }
});

export const shoppingListRouter = router;
