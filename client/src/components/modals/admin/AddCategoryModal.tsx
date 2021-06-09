import * as React from "react";
import { connect } from "react-redux";
import { Modal } from "@components/Modal/Modal";
import { ModalIds } from "@t/ModalIds";
import styles from "css/forms.module.scss";
import { closeModal } from "@lib/modal";
import useModalEvent from "src/hooks/useModalEvent";
import { RequestData } from "@lib/fetch";
import { addCategory } from "@actions/admin/categories";

interface Props {
  addCategory: (data: RequestData) => Promise<boolean>;
}

const AddCategoryModal = ({ addCategory }: Props) => {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ref = useModalEvent(ModalIds.AddCategory);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const success = await addCategory({ name });

    if (success) {
      closeModal(ModalIds.AddCategory);
      setName("");
    }

    setLoading(false);
  }

  return (
    <Modal title="Add a new category" id={ModalIds.AddCategory}>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="add-user-name">Name</label>
          <input
            ref={ref}
            id="add-user-name"
            type="text"
            className={styles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => closeModal(ModalIds.AddCategory)}
            className="btn link-btn"
          >
            Cancel
          </button>

          <button disabled={loading} type="submit" className={styles.submitBtn}>
            {loading ? "loading.." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default connect(null, { addCategory })(AddCategoryModal);
