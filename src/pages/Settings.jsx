import { useAuth } from "../contexts/authContext";
import SetPassword from "../components/SetPassword";
import DeleteAccount from "../components/DeleteAccount";
import ChangePassword from "../components/ChangePassword";
import { useLocalStorage } from "../hooks/useLocalStorage";
import DisconnectGoogleAccount from "../components/DisconnectGoogleAccount";
import ProfileForm from "../components/ProfileForm";

const Settings = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useLocalStorage(
    "settingsTab",
    localStorage.getItem("settingsTab") === null
      ? "pass"
      : localStorage.getItem("settingsTab")
  );

  const handleTabs = (event) => {
    const element = event.target;

    if (element.id === "v-pills-pass-tab") {
      setCurrentTab("pass");
    } else if (element.id === "v-pills-accntManage-tab") {
      setCurrentTab("accntManage");
    } else {
      alert("Error setting current tab state: Can't determine the Tab ID!");
    }
  };

  if (!user) return null;

  return (
    <>
      <h3 className="py-3 text-center">Settings</h3>
      <div className="d-flex align-items-start h-100">
        <nav
          className="col-md-2 nav nav-pills p-3 border border-1"
          style={{ rowGap: "1.5rem" }}
          id="v-pills-tab"
          role="tablist"
          aria-orientation="vertical"
        >
          <button
            className={
              (currentTab === "pass" ? "nav-link active" : "nav-link") +
              " w-100"
            }
            id="v-pills-pass-tab"
            data-bs-toggle="pill"
            data-bs-target="#v-pills-pass"
            type="button"
            role="tab"
            aria-controls="v-pills-pass"
            aria-selected={currentTab === "pass" ? "true" : "false"}
            onClick={(event) => {
              handleTabs(event);
            }}
          >
            Password Management
          </button>

          <button
            className={
              (currentTab === "accntManage" ? "nav-link active" : "nav-link") +
              " w-100"
            }
            id="v-pills-accntManage-tab"
            data-bs-toggle="pill"
            data-bs-target="#v-pills-accntManage"
            type="button"
            role="tab"
            aria-controls="v-pills-accntManage"
            aria-selected={currentTab === "accntManage" ? "true" : "false"}
            onClick={(event) => {
              handleTabs(event);
            }}
          >
            Account Management
          </button>
        </nav>

        <section
          className="col-md-10 tab-content p-4 border border-1"
          id="v-pills-tabContent"
        >
          <div
            className={
              currentTab === "pass"
                ? "tab-pane fade show active"
                : "tab-pane fade"
            }
            id="v-pills-pass"
            role="tabpanel"
            aria-labelledby="v-pills-pass-tab"
            tabIndex="0"
          >
            {user.isPassSet === true ? (
              <>
                <h4 className="mb-5">Change Password</h4>
                <ChangePassword />
              </>
            ) : (
              <>
                <h4 className="mb-5">Set Password</h4>
                <SetPassword />
              </>
            )}
          </div>

          <div
            className={
              currentTab === "accntManage"
                ? "tab-pane fade show active"
                : "tab-pane fade"
            }
            id="v-pills-accntManage"
            role="tabpanel"
            aria-labelledby="v-pills-accntManage-tab"
            tabIndex="0"
          >
            <>
              <h4 className="mb-4">Profile</h4>
              <ProfileForm />
              <hr className="my-4" />

              {user.isPassSet && user.isGoogleSet && (
                <>
                  <h4 className="mb-4">Disconnect Google Account</h4>
                  <DisconnectGoogleAccount />
                  <hr className="my-4" />
                </>
              )}

              <h4 className="mb-4">Delete Account</h4>
              <DeleteAccount />
            </>
          </div>
        </section>
      </div>
    </>
  );
};

export default Settings;
