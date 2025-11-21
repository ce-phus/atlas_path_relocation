import React, { useEffect, useState } from 'react'
import { CLayout, ClientDashboard } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { fetchConsultantStats, fetchConsultantsClients } from '../../actions/consultantActions'

const Index = () => {

  const dispatch = useDispatch();

  const { clients_data, loading, error } = useSelector((state) => state.fetchConsultantClientReducer);
  console.group("Clients Data", clients_data);

  const { stats_data, loading: statsLoading, error: statsError } = useSelector((state) => state.fetchConsultantStatsReducer);

  const globalLoading = loading || statsLoading;
  const globalError = error || statsError;

 useEffect(()=> {
  dispatch(fetchConsultantsClients());
  dispatch(fetchConsultantStats());
 }, [dispatch]);

  if (globalLoading) {
    return (
      <CLayout>
          <div className="min-h-screen bg-white py-8 pt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="animate-pulse space-y-8">
                      {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-gray-200 rounded-2xl p-6 h-32"></div>
                      ))}
                  </div>
              </div>
          </div>
      </CLayout>
  );
  }

  if (globalError) {
    return (
      <CLayout>
          <div className="min-h-screen bg-white py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-red-500 text-center">
                      <p>Error: {globalError}</p>
                  </div>
              </div>
          </div>
      </CLayout>
    );
  }

  return (
    <CLayout>
        <ClientDashboard 
        stats_data={stats_data}
        />
    </CLayout>
  )
}

export default Index