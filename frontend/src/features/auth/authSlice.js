import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAPI, userAPI } from "../../services/api";

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await userAPI.getProfile();
            return res.data.data.user;
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("accessToken");
                window.dispatchEvent(new StorageEvent("storage", { key: "accessToken", newValue: null }));
            };

            return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (newAccessToken, { dispatch }) => {
        localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
        window.dispatchEvent(new StorageEvent("storage", { key: "accessToken", newValue: JSON.stringify(newAccessToken) }));
        await dispatch(fetchUser());
        return newAccessToken;
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { getState }) => {
        const token = getState().auth.accessToken;

        if (token) {
            try {
                await authAPI.logout();
            } catch (error) {
                console.log("Logout API failed:", error);
            }
        }

        localStorage.removeItem("accessToken");
        window.dispatchEvent(new StorageEvent("storage", { key: "accessToken", newValue: null }));
    }
);

const initialAccessToken = localStorage.getItem("accessToken") ? JSON.parse(localStorage.getItem("accessToken")) : null;

const initialAuthState = {
    user: null,
    accessToken: initialAccessToken,
    loading: !!initialAccessToken,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthState,
    reducers: {
        setError(state, action) {
            state.error = action.payload;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
        .addCase(fetchUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.user = null;
            state.accessToken = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.accessToken = action.payload;
        })
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.accessToken = null;
            state.loading = false;
            state.error = null;
        })
    },
});

export const { setError, clearError } = authSlice.actions;
export default authSlice.reducer;