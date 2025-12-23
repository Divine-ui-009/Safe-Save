import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  BarChart2, 
  Bell, 
  X, 
  LogOut,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, path, active, onClick }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        active
          ? 'bg-indigo-50 text-indigo-600'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <span className={`mr-3 ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
        {icon}
      </span>
      {label}
    </button>
  );
};

export function AdminLayout({ 
  children,
  activeScreen,
  onNavigate
}: { 
  children: ReactNode;
  activeScreen: string;
  onNavigate: (screen: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', screen: 'home' },
    { icon: <Users size={18} />, label: 'Members', screen: 'members' },
    { icon: <HandCoins size={18} />, label: 'Loans', screen: 'loans' },
    { icon: <BarChart2 size={18} />, label: 'Reports', screen: 'reports' },
    { icon: <Bell size={18} />, label: 'Alerts', screen: 'alerts' },
  ];

  // Check if admin is authenticated
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      navigate('/login');
      return;
    }

    // Verify token (in a real app, this would be more thorough)
    try {
      const tokenData = JSON.parse(atob(adminToken));
      const tokenAge = Date.now() - tokenData.timestamp;
      const maxTokenAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge >= maxTokenAge) {
        localStorage.removeItem('admin_token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error verifying admin token:', error);
      localStorage.removeItem('admin_token');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="text-xl font-bold text-indigo-600">SafeSave Admin</div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.screen}
                icon={item.icon}
                label={item.label}
                path={`/admin/${item.screen}`}
                active={activeScreen === item.screen}
                onClick={() => {
                  onNavigate(item.screen);
                  setSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut size={18} className="mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-500 rounded-md lg:hidden hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                A
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}