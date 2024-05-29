import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface ModalState {
  isVisible: boolean;
}

export const initialState: ModalState = { isVisible: false };

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isVisible = !state.isVisible;
    },
  },
});

export const { toggleSidebar } = sidebarSlice.actions;

export const selectSidebar = (state: RootState): ModalState =>
  state.rightSidebar;

export default sidebarSlice.reducer;
