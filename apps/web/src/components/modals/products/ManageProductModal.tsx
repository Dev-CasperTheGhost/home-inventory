import * as React from "react";
import { connect } from "react-redux";
import format from "date-fns/format";
import { Modal } from "@components/Modal/Modal";
import { ModalIds } from "@t/ModalIds";
import styles from "css/forms.module.scss";
import { closeModal, openModal } from "@lib/modal";
import useModalEvent from "src/hooks/useModalEvent";
import type { RequestData } from "@lib/fetch";
import { deleteProductById, updateProductById } from "@actions/products";
import type { State } from "@t/State";
import type { Category } from "@t/Category";
import { Select, SelectValue } from "@components/Select/Select";
import type { Product } from "@t/Product";
import { AlertModal } from "@components/modals/AlertModal";
import { useHouseId } from "@hooks/useHouseId";
import { setter } from "@lib/setter";

interface Props {
  product: Product | null;
  currency: string;

  categories: Category[];
  deleteProductById(houseId: string, id: string): Promise<boolean>;
  updateProductById(houseId: string, id: string, data: RequestData): Promise<boolean>;
}

const ManageProductModal = ({
  updateProductById,
  deleteProductById,
  categories,
  product,
  currency,
}: Props) => {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [expireDate, setExpireDate] = React.useState("");
  const [category, setCategory] = React.useState<SelectValue | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [warnOnQuantity, setWarnOnQuantity] = React.useState({ value: "2", checked: false });
  const [ignoreQuantityWarning, setIgnoreWarning] = React.useState(false);
  const [createdAt, setCreatedAt] = React.useState("");

  const houseId = useHouseId();
  const ref = useModalEvent(ModalIds.ManageProduct);

  React.useEffect(() => {
    if (!product) return;

    const foundCategory = categories.find((c) => c.id === product.categoryId);

    if (foundCategory) {
      setCategory({ value: foundCategory.id, label: foundCategory.name });
    } else {
      setCategory(null);
    }

    if (product.warnOnQuantity !== 2 && product.warnOnQuantity !== null) {
      setWarnOnQuantity({ value: product.warnOnQuantity.toString(), checked: true });
    } else {
      setWarnOnQuantity({ value: "2", checked: false });
    }

    setName(product.name);
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setExpireDate(product.expirationDate ?? "");
    setCreatedAt(product.createdAt);
  }, [product, categories]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (!product) return;

    const success = await updateProductById(houseId, product.id, {
      name,
      price: Number(Number(price).toFixed(2)),
      quantity: Number(quantity),
      expirationDate: expireDate || null,
      categoryId: category?.value ?? null,
      warnOnQuantity: warnOnQuantity.checked ? Number(warnOnQuantity.value) : null,
      ignoreQuantityWarning,
      createdAt: createdAt || null,
    });

    setLoading(false);

    if (success) {
      closeModal(ModalIds.ManageProduct);
      setName("");
    }
  }

  async function handleDeleteProduct() {
    if (!product) return;

    const success = await deleteProductById(houseId, product.id);

    if (success) {
      closeModal(ModalIds.AlertDeleteProduct);
      closeModal(ModalIds.ManageProduct);
    }
  }

  return (
    <Modal title={`Managing ${product?.name}`} id={ModalIds.ManageProduct}>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="manage-product-name">Name</label>
          <input
            required
            ref={ref}
            id="manage-product-name"
            type="text"
            className={styles.formInput}
            value={name}
            onChange={setter(setName)}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="manage-product-price">Price</label>
            <input
              id="manage-product-price"
              type="text"
              className={styles.formInput}
              value={price}
              onChange={setter(setPrice)}
              placeholder={currency}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="manage-product-name">Quantity</label>
            <input
              required
              id="manage-product-quantity"
              type="number"
              className={styles.formInput}
              value={quantity}
              onChange={setter(setQuantity)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="manage-product-category">Category</label>

          <Select
            isClearable
            value={category}
            onChange={setCategory}
            options={categories.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="manage-product-expire-date">Expiration Date (optional)</label>
            <input
              id="manage-product-expire-date"
              type="date"
              className={styles.formInput}
              value={expireDate && format(new Date(expireDate), "yyyy-MM-dd")}
              onChange={setter(setExpireDate)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="manage-product-created-at">Created at (optional)</label>
            <input
              id="manage-product-created-at"
              type="date"
              className={styles.formInput}
              value={createdAt && format(new Date(createdAt), "yyyy-MM-dd")}
              onChange={setter(setCreatedAt)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formCheckboxGroup}>
            <label htmlFor="manage-product-custom-warn-quantity">
              custom {"'warn on quantity'"}
            </label>
            <input
              id="manage-product-custom-warn-quantity"
              onChange={() => setWarnOnQuantity((p) => ({ checked: !p.checked, value: p.value }))}
              checked={warnOnQuantity.checked}
              type="checkbox"
            />
          </div>

          {warnOnQuantity.checked ? (
            <div style={{ marginBottom: "0", marginTop: "1rem" }} className={styles.formGroup}>
              <label htmlFor="manage-product-warn-quantity">Warn on quantity</label>
              <input
                id="manage-product-warn-quantity"
                type="number"
                className={styles.formInput}
                value={warnOnQuantity.value}
                onChange={(e) =>
                  setWarnOnQuantity((p) => ({ checked: p.checked, value: e.target.value }))
                }
              />
            </div>
          ) : null}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.formCheckboxGroup}>
            <label htmlFor="manage-product-ignore-quantity-warning">Ignore quantity warning</label>
            <input
              checked={ignoreQuantityWarning}
              id="manage-product-ignore-quantity-warning"
              onChange={() => setIgnoreWarning((p) => !p)}
              type="checkbox"
            />
          </div>

          <p style={{ marginTop: "0.5rem" }}>
            When checked, this product will, when low on quantity, <strong>not</strong> show up on
            the home page.
          </p>
        </div>

        <div>
          <button
            onClick={() => openModal(ModalIds.AlertDeleteProduct)}
            type="button"
            className="btn danger"
          >
            Delete product
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => closeModal(ModalIds.ManageProduct)}
            className="btn link-btn"
          >
            Cancel
          </button>

          <button disabled={loading} type="submit" className="btn submit">
            {loading ? "updating.." : "Update"}
          </button>
        </div>
      </form>

      <AlertModal
        id={ModalIds.AlertDeleteProduct}
        title="Delete product"
        description="Are you sure you want to remove this product?"
        actions={[
          {
            name: "Cancel",
            onClick: () => closeModal(ModalIds.AlertDeleteProduct),
          },
          {
            name: "Delete",
            danger: true,
            onClick: handleDeleteProduct,
          },
        ]}
      />
    </Modal>
  );
};

const mapToProps = (state: State) => ({
  categories: state.admin.categories,
  currency: state.houses.house?.currency ?? "???",
});

export default connect(mapToProps, { updateProductById, deleteProductById })(ManageProductModal);
