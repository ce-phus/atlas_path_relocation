import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register, Home, Profile, Tasks, Documents, Budget } from "./pages"
import { Index, Cprofile, EditCprofile, ClientProfile } from './consultant/pages';
import { logo } from './assets';

import { useSelector, useDispatch } from 'react-redux';
import { getProfile } from './actions/profileActions';
import React from 'react';
import { logout } from './actions/userActions';

function App() {
  const { consultant } = useSelector(
    (state) => state.getConsultantProfileReducer
  );

  const dispatch = useDispatch();

  const { profile, loading } = useSelector((state)=> state.getProfileReducer)
  console.log(" Profile:", profile);

  const { userInfo } = useSelector((state) => state.userLoginReducer);

  React.useEffect(()=> {
    if (!userInfo) {
      dispatch(logout());
    }
  }, [dispatch, userInfo]);

  React.useEffect(()=> {
      dispatch(getProfile());
    
  }, [dispatch]);

  if (loading) {
    return <div className="flex flex-col items-center justify-center lg:pt-64 md:pt-20 pt-10">
      <img 
      src={logo}
      className='h-20 w-20'
      />
      <svg 
        className="animate-spin h-15 w-15 mx-auto mt-20" 
        viewBox="0 0 24 24"
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="none" 
          strokeLinecap="round"
          strokeDasharray="40 100"
          className="text-indigo-600 opacity-60"
        />
      </svg>
    </div>;
  }

  const isConsultant = profile?.is_consultant;

  return (
    <Router>
      <Routes>
        {isConsultant ? (
          <>
            <Route path="/*" element={<Index />} />
            <Route path="/profile" element={<Cprofile />} />
            <Route path='/edit' element={<EditCprofile />} />
            <Route path='/client/:id' element={<ClientProfile />} />
          </>
        ) : (
          <>
            <Route path="/sign-in" element={<Login />} />
            <Route path="/sign-up" element={<Register />} />
            <Route path="/*" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/budget" element={<Budget />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

