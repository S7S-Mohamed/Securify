import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar/Navbar';

export const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
};