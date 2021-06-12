import ReactToolTip from "react-tooltip";
import format from "date-fns/format";
import { Product } from "@t/Product";
import { filters } from "src/pages/[houseId]/products";

interface Props {
  products: Product[];
  showActions?: boolean;
  currentFilter?: keyof typeof filters | "expirationDate" | null;

  onManageClick?: (product: Product) => unknown;
}

export const ProductsTable = ({ products, currentFilter, showActions, onManageClick }: Props) => {
  return (
    <table style={{ marginTop: "1rem" }} className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Total amount</th>
          <th>Quantity</th>
          <th>Expiration Date</th>
          {showActions ? <th>Actions</th> : null}
        </tr>
      </thead>

      <tbody>
        {products.map((product) => {
          /**
           * set the current filter to bold
           */
          const boldText = (str: string) => {
            return currentFilter === str;
          };

          const totalPricesAmount = (product.prices ?? [])
            ?.reduce((ac, curr) => ac + curr, 0)
            .toFixed(2);

          return (
            <tr key={product.id}>
              <td className={boldText("name") ? "bold" : ""}>
                <span data-tip data-for="ProductName">
                  {product.name}
                </span>

                <ReactToolTip
                  textColor="var(--dark)"
                  backgroundColor="#bbbbbb"
                  place="top"
                  id="ProductName"
                  effect="solid"
                  className="tooltip-overwrite"
                >
                  <p>
                    <strong>Created at: </strong>
                    {format(new Date(product.createdAt), "yyyy-MM-dd")}
                  </p>

                  <p>
                    <strong>Last updated: </strong>
                    {format(new Date(product.updatedAt), "yyyy-MM-dd")}
                  </p>
                </ReactToolTip>
              </td>
              <td className={boldText("price") || boldText("priceHigh") ? "bold" : ""}>
                €{product.price.toFixed(2)}
              </td>
              <td>€{totalPricesAmount}</td>
              <td className={boldText("quantity") || boldText("quantityHigh") ? "bold" : ""}>
                {product.quantity}
              </td>
              <td className={boldText("expirationDate") ? "bold" : ""}>
                {product.expirationDate ?? "N/A"}
              </td>

              {showActions ? (
                <td id="table-actions">
                  <button onClick={() => onManageClick?.(product)} className="btn small">
                    Manage
                  </button>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};