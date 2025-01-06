// src/App.jsx
import EmulatorStatus from './components/EmulatorStatus.jsx';
import ProgramLibrary from './components/ProgramLibrary.jsx';
import ProgramDetail from './components/ProgramDetail.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home, MonitorSmartphone, List, Edit2, Settings, Search, AlertTriangle, LineChart, Shield } from 'lucide-react';
import PropTypes from 'prop-types';



const NavItem = ({ to, icon: Icon, children }) => (
    <Link
        to={to}
        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg whitespace-nowrap"
    >
        <Icon size={18} className="flex-shrink-0" />
        <span>{children}</span>
    </Link>
);
NavItem.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    children: PropTypes.node.isRequired,
};

// Navbar component with all navigation items
const Navbar = () => (
    <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <MonitorSmartphone size={24} />
                <span className="text-xl font-bold">Retro Launcher Admin</span>
            </div>
            <div className="flex flex-col gap-1">
                <NavItem to="/" icon={Home}>Dashboard</NavItem>
                <NavItem to="/status" icon={LineChart}>Emulator Status</NavItem>
                <NavItem to="/programs" icon={List}>Program Library</NavItem>
                <NavItem to="/program/new" icon={Edit2}>Add Program</NavItem>
                <NavItem to="/platforms" icon={MonitorSmartphone}>Platforms</NavItem>
                <NavItem to="/search" icon={Search}>Advanced Search</NavItem>
                <NavItem to="/moderation" icon={AlertTriangle}>Moderation Queue</NavItem>
                <NavItem to="/settings" icon={Settings}>System Settings</NavItem>
                <NavItem to="/security" icon={Shield}>Security Log</NavItem>
            </div>
        </div>
    </nav>
);

// Layout component


const Layout = ({children }) => (
    <div className="flex min-h-screen bg-gray-100">
        <aside className="w-64 fixed h-full">
            <Navbar />
        </aside>
        <main className="ml-64 flex-1">
            <div className="container mx-auto">
                {children}
            </div>
        </main>
    </div>
);
Layout.propTypes = {
    children: PropTypes.node.isRequired,
};



// Page Components (these would be in separate files normally)
const Dashboard = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                <div className="space-y-2">
                    <div>Total Programs: 150</div>
                    <div>Pending Review: 5</div>
                    <div>Recently Added: 12</div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">System Status</h2>
                <EmulatorStatus />
            </div>
        </div>
    </div>
);

const EmulatorStatusPage = () => (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Emulator Status</h1>
        <EmulatorStatus />
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/status" element={<EmulatorStatusPage />} />
                    <Route path="/programs" element={<ProgramLibrary />} />
                    <Route path="/program/:id" element={<ProgramDetail />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;