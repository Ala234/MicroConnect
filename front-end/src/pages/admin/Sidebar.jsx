import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

const menu = [
  { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
  { name: "Manage Users", path: "/ManageUsers", icon: <Users size={20} /> },
  { name: "Contracts", path: "/AdminContracts", icon: <FileText size={20} /> },
  { name: "Transactions", path: "/transactions", icon: <DollarSign size={20} /> },
  { name: "Disputes", path: "/disputes", icon: <AlertTriangle size={20} /> },
  { name: "Content Review", path: "/ContentReview", icon: <ClipboardCheck size={20} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

const Sidebar = ({ onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar") === "true"
  );

  useEffect(() => {
    localStorage.setItem("sidebar", collapsed);
    if (onCollapse) onCollapse(collapsed);
  }, [collapsed]);

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <ul>
        {menu.map((item) => (
          <li
            key={item.path}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span><strong>{item.name}</strong></span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;