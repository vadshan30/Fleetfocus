import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import useAuth from '../../hooks/useAuth';

const AccessDenied = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 border border-rose-100 dark:border-rose-900/50 shadow-inner">
          <Icon name="ShieldAlert" size={32} />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 mb-3">
          Error 403 · Forbidden
        </span>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          You don't have permission to access this page. Your current role is{' '}
          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
            {role || user?.role || 'Guest'}
          </strong>
          .
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Icon name="LayoutDashboard" size={16} />
            <span>Go to Dashboard</span>
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
