import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SetPassword from "../components/SetPassword";
import DeleteAccount from "../components/DeleteAccount";
import ChangePassword from "../components/ChangePassword";
import DisconnectGoogleAccount from "../components/DisconnectGoogleAccount";
import ProfileForm from "../components/ProfileForm";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { FiLock, FiUser } from "react-icons/fi";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTab, setCurrentTab] = useLocalStorage(
    "settingsTab",
    localStorage.getItem("settingsTab") === null
      ? "pass"
      : localStorage.getItem("settingsTab")
  );

  const handleTabs = (event) => {
    // Use currentTarget instead of target to ensure we get the BUTTON element
    const elementId = event.currentTarget.id;

    if (elementId === "v-pills-pass-tab") {
      setCurrentTab("pass");
    } else if (elementId === "v-pills-accntManage-tab") {
      setCurrentTab("accntManage");
    } else {
      alert("Error setting current tab state: Can't determine the Tab ID!");
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="ps-3 my-5 text-center text-sm-start">
        <h2 className="fw-bold mb-1">Settings</h2>
        <p className="text-muted">Manage your account security and preferences</p>
      </div>

      <div className="row g-4 mb-5">
        {/* Sidebar Navigation */}
        <div className="col-12 col-lg-2 col-sm-3 pe-0">
          <div className="nav nav-pills row-gap-3 flex-row flex-sm-column" id="v-pills-tab" role="tablist">

            {/* Account Management Tab */}
            <button
              className={`border rounded-3 px-4 py-2 d-flex align-items-center gap-3 ${currentTab === "accntManage"
                  ? "hover-bg-light nav-link active"
                  : "bg-white text-secondary hover-bg-light"}`}
              id="v-pills-accntManage-tab"
              type="button"
              role="tab"
              aria-selected={currentTab === "accntManage"}
              onClick={handleTabs}
            >
              <FiUser size={18} />
              <span>Account Management</span>
            </button>

            {/* Password Management Tab */}
            <button
              className={`border rounded-3 px-4 py-2 d-flex align-items-center gap-3 ${currentTab === "pass"
                  ? "hover-bg-light nav-link active"
                  : "bg-white text-secondary hover-bg-light"}`}
              id="v-pills-pass-tab"
              type="button"
              role="tab"
              aria-selected={currentTab === "pass"}
              onClick={handleTabs}
            >
              <FiLock size={18} />
              <span>Password Management</span>
            </button>

          </div>
        </div>

        {/* Content Area */}
        <div className="col-12 col-sm-9 col-lg-10">
          <div
            className="border shadow-sm rounded-4 p-4 p-md-5"
            id="v-pills-tabContent"
          >
            <div
              className={
                currentTab === "pass"
                  ? "animate-fade-in"
                  : "d-none"
              }
              role="tabpanel"
            >
              {user.isPassSet !== true ? (
                <>
                  <h4 className="fw-bold mb-5 text-center">Change Password</h4>
                  <ChangePassword />
                </>
              ) : (
                <>
                  <h4 className="fw-bold mb-5 text-center">Set Password</h4>
                  <SetPassword />
                </>
              )}
            </div>

            <div
              className={
                currentTab === "accntManage"
                  ? "animate-fade-in"
                  : "d-none"
              }
              role="tabpanel"
            >
              <div className="mb-5">
                <h4 className="fw-bold mb-3">Profile</h4>
                <p className="text-muted small mb-4">
                  Update your personal information and public profile.
                </p>
                <ProfileForm />
              </div>

              <hr className="my-5" />

              {user.isPassSet && user.isGoogleSet && (
                <>
                  <div className="mb-5">
                    <h4 className="fw-bold mb-3">
                      Disconnect Google Account
                    </h4>
                    <p className="text-muted small mb-4">
                      Remove your Google login access. You will need to use
                      your password to log in afterwards.
                    </p>
                    <DisconnectGoogleAccount />
                  </div>
                  <hr className="my-5" />
                </>
              )}

              <div className="mb-5">
                <h4 className="fw-bold mb-3 text-danger">
                  Delete Account
                </h4>
                <p className="text-muted small mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <DeleteAccount />
              </div>

              {user.role === "buyer" && (
                <>
                  <hr className="my-5" />
                  <div className="p-4 rounded-3 border">
                    <h4 className="fw-bold mb-3">Create Your Own Shop</h4>
                    <p className="mb-3">
                      If you want to create your own shop, and publish your own
                      digital products, please do so by creating your own shop
                      from the{" "}
                      <Link
                        to="/buyer/create-shop"
                        className="fw-bold text-primary text-decoration-none"
                      >
                        create shop page
                      </Link>
                      .
                    </p>
                    <Link
                      to="/buyer/create-shop"
                      className="btn btn-primary rounded-pill px-4"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
