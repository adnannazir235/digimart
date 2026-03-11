import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAPI, userAPI } from "../../services/api";
import { getAccessToken, setAccessToken, removeAccessToken } from "../../utils/tokenUtils";

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { rejectWithValue }) => {
        try {
            const res = await userAPI.getProfile();
            return res.data.data.user;
        } catch (error) {
            if (error.response?.status === 401) {
                removeAccessToken();
            }
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user");
        }
    }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data, { dispatch }) => {
    const { accessToken, isCountrySelected } = data;

    setAccessToken(accessToken);
    await dispatch(fetchUser());

    return { accessToken, isCountrySelected };
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
        removeAccessToken();
    }
);

const initialAuthState = {
    user: null,
    accessToken: getAccessToken(),
    loading: !!getAccessToken(),
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
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        setIsCountrySelected(state, action) {
            state.isCountrySelected = action.payload;
        },
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
            state.accessToken = action.payload.accessToken;
            state.isCountrySelected = action?.payload?.isCountrySelected;
        })
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.accessToken = null;
            state.loading = false;
            state.error = null;
        })
    },
});

// The important derived one – "should we show the country popup?"
export const selectShouldShowCountryPopup = (state) => {
    const { accessToken, user, isCountrySelected } = state.auth;

    // Only show if we actually have the flag (after login)
    if (isCountrySelected === undefined) return false;

    return !!accessToken && user !== null && isCountrySelected === false;
};

export const { setError, clearError, setUser, setIsCountrySelected } = authSlice.actions;
export default authSlice.reducer;