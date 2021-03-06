import * as React from "react";
import { connect } from "react-redux";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import type { GetServerSideProps } from "next";

import { checkAuth } from "@actions/auth";
import type { State } from "@t/State";
import { initializeStore } from "src/store/store";
import { AdminLayout } from "@components/Layout";
import { getAllCategories } from "@actions/admin/categories";
import { UserRole } from "@t/User";
import { openModal } from "@lib/modal";
import { ModalIds } from "@t/ModalIds";
import type { Category } from "@t/Category";
import { useHasAccess } from "@hooks/useHasAccess";
import { getCurrentHouse } from "@actions/houses";
import { useIsAuth } from "@hooks/useIsAuth";
import { useValidHouse } from "@hooks/useValidHouse";

const AddCategoryModal = dynamic(() => import("@components/modals/admin/AddCategoryModal"));
const ManageCategoryModal = dynamic(() => import("@components/modals/admin/ManageCategoryModal"));

interface Props {
  categories: Category[];
}

const CategoriesAdminPage = ({ categories }: Props) => {
  const [tempCategory, setTempCategory] = React.useState<Category | null>(null);

  const router = useRouter();
  const { loading, hasAccess } = useHasAccess(UserRole.ADMIN);
  useIsAuth();
  useValidHouse();

  React.useEffect(() => {
    if (!loading && !hasAccess) {
      router.push("/404");
    }
  }, [loading, hasAccess, router]);

  function handleManage(category: Category) {
    setTempCategory(category);

    openModal(ModalIds.ManageCategory);
  }

  function sortByCreatedAt(a: Category, b: Category) {
    return new Date(b.createdAt) > new Date(a.createdAt) ? -1 : 1;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Manage categories - Inventory</title>
      </Head>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1>Categories</h1>

          <button onClick={() => openModal(ModalIds.AddCategory)} className="btn">
            Add category
          </button>
        </div>

        {categories.length <= 0 ? (
          <p>
            There {"aren't"} any categories yet.
            <button onClick={() => openModal(ModalIds.AddCategory)} className="btn link-btn">
              Create one
            </button>
          </p>
        ) : (
          <table style={{ marginTop: "0.5rem" }} className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories
                .sort((a, b) => sortByCreatedAt(a, b))
                .map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td style={{ width: "100px" }} id="table-actions">
                      <button onClick={() => handleManage(category)} className="btn small">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <ManageCategoryModal category={tempCategory} />
      <AddCategoryModal />
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const store = initializeStore();
  const cookie = ctx.req.headers.cookie;
  const houseId = ctx.query.houseId as string;

  await checkAuth(cookie)(store.dispatch);
  await getCurrentHouse(houseId, cookie)(store.dispatch);
  await getAllCategories(houseId, cookie)(store.dispatch);

  return { props: { initialReduxState: store.getState() } };
};

const mapToProps = (state: State): Props => ({
  categories: state.admin.categories,
});

export default connect(mapToProps)(CategoriesAdminPage);
