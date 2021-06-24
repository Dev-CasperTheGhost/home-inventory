import { GetServerSideProps } from "next";
import * as React from "react";
import { connect } from "react-redux";
import Head from "next/head";

import { checkAuth, updateUserSettings } from "@actions/auth";
import { Layout } from "@components/Layout";
import { useIsAuth } from "@hooks/useIsAuth";
import { State } from "@t/State";
import { User } from "@t/User";
import { initializeStore } from "src/store/store";

import formStyles from "css/forms.module.scss";
import { setter } from "@lib/setter";
import { RequestData } from "@lib/fetch";

interface Props {
  user: User | null;

  updateUserSettings: (data: RequestData) => Promise<boolean>;
}

const SettingsPage = ({ user, updateUserSettings }: Props) => {
  useIsAuth();

  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
    }
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    await updateUserSettings({ name, email, password });

    setLoading(false);
  }

  return (
    <Layout>
      <Head>
        <title>User Settings - Inventory</title>
      </Head>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "1rem 0",
        }}
      >
        <h1>Settings</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className={formStyles.formGroup}>
          <label htmlFor="name">Name</label>

          <input
            type="text"
            id="name"
            className={formStyles.formInput}
            value={name}
            onChange={setter(setName)}
            required
          />
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="email">Email</label>

          <input
            type="email"
            id="email"
            className={formStyles.formInput}
            value={email}
            onChange={setter(setEmail)}
            required
          />
        </div>

        <div className={formStyles.formGroup}>
          <label htmlFor="confirm-password">Confirm password</label>

          <input
            type="password"
            id="confirm-password"
            className={formStyles.formInput}
            value={password}
            onChange={setter(setPassword)}
            required
          />
        </div>

        <div style={{ float: "right" }}>
          <button
            disabled={loading || !name || !email || !password}
            className={formStyles.submitBtn}
          >
            {loading ? "saving.." : "Save settings"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const store = initializeStore();
  const cookie = ctx.req.headers.cookie;

  await checkAuth(cookie)(store.dispatch);

  return { props: { initialReduxState: store.getState() } };
};

const mapToProps = (state: State) => ({
  user: state.auth.user,
});

export default connect(mapToProps, { updateUserSettings })(SettingsPage);