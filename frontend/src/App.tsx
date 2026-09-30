import React from 'react';
import { Route, Switch } from 'wouter';
import { WalletProvider } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { PlayPage } from './pages/PlayPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <div className="gno-app-container">
        <Navbar />
        <main className="main-content">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/play" component={PlayPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/about" component={AboutPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </main>
      </div>
    </WalletProvider>
  );
};

export default App;
