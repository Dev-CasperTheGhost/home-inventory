import * as React from "react";
import { connect } from "react-redux";
import { addHouse } from "@actions/houses";
import { Modal } from "@components/Modal/Modal";
import { ModalIds } from "@t/ModalIds";
import type { RequestData } from "@lib/fetch";
import { closeModal } from "@lib/modal";
import styles from "css/forms.module.scss";
import useModalEvent from "@hooks/useModalEvent";
import { setter } from "@lib/setter";

interface Props {
  addHouse(data: RequestData): Promise<boolean>;
}

const AddHouseModal = ({ addHouse }: Props) => {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ref = useModalEvent(ModalIds.AddHouse);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const success = await addHouse({ name });

    if (success) {
      closeModal(ModalIds.AddHouse);
      setName("");
    }

    setLoading(false);
  }

  return (
    <Modal title="Add a new house" id={ModalIds.AddHouse}>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="add-house-name">Name</label>
          <input
            ref={ref}
            id="add-house-name"
            className={styles.formInput}
            value={name}
            onChange={setter(setName)}
          />
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
            onClick={() => closeModal(ModalIds.AddHouse)}
            className="btn link-btn"
          >
            Cancel
          </button>
          <button disabled={loading} type="submit" className="btn submit">
            {loading ? "loading.." : "Add house"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default connect(null, { addHouse })(AddHouseModal);
