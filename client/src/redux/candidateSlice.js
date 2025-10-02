import { createSlice } from '@reduxjs/toolkit';

/**
 * Candidate Slice
 * Manages candidate profile and list of saved candidates
 */
const initialState = {
  // Current candidate profile
  profile: {
    name: '',
    email: '',
    phone: '',
    designation: '',
    location: '',
    github: '',
    linkedin: '',
  },
  
  // List of saved candidates (for interviewer view)
  savedCandidates: [],
  
  // Loading states
  loading: false,
  savingCandidate: false,
  
  // Selected candidate for detail view
  selectedCandidate: null,
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    // Set candidate profile
    setProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    
    // Update specific field in profile
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      state.profile[field] = value;
    },
    
    // Clear profile (for new interview)
    clearProfile: (state) => {
      state.profile = {
        name: '',
        email: '',
        phone: '',
        designation: '',
        location: '',
        github: '',
        linkedin: '',
      };
    },
    
    // Set list of saved candidates
    setSavedCandidates: (state, action) => {
      state.savedCandidates = action.payload;
    },
    
    // Add a new candidate to saved list
    addSavedCandidate: (state, action) => {
      state.savedCandidates.unshift(action.payload); // Add to beginning
    },
    
    // Set selected candidate for detail view
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set saving state
    setSavingCandidate: (state, action) => {
      state.savingCandidate = action.payload;
    },
  },
});

export const {
  setProfile,
  updateProfileField,
  clearProfile,
  setSavedCandidates,
  addSavedCandidate,
  setSelectedCandidate,
  setLoading,
  setSavingCandidate,
} = candidateSlice.actions;

export default candidateSlice.reducer;
