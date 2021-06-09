import * as React from "react";
import { Modal } from "@components/Modal/Modal";
import { ModalIds } from "@t/ModalIds";
import styles from "css/forms.module.scss";
import { closeModal } from "@lib/modal";
import useModalEvent from "src/hooks/useModalEvent";
import { Select, SelectValue } from "@components/Select/Select";
import { selectRoles } from "@lib/constants";

export const AddUserModal = () => {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<SelectValue | null>(null);

  const ref = useModalEvent(ModalIds.AddUser);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // todo: add API request
  }

  return (
    <Modal title="Add a new user" id={ModalIds.AddUser}>
      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="add-user-email">Email</label>
          <input
            ref={ref}
            id="add-user-email"
            type="email"
            className={styles.formInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="add-user-name">Name</label>
          <input
            id="add-user-name"
            type="text"
            className={styles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="add-user-role">Role</label>

          <Select value={role} onChange={setRole} options={selectRoles} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="add-user-password">Password</label>
          <input
            id="add-user-password"
            type="password"
            className={styles.formInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => closeModal(ModalIds.AddUser)}
            className="btn link-btn"
          >
            Cancel
          </button>

          <button type="submit" className={styles.submitBtn}>
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};