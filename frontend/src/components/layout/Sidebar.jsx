import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Heart, Target, ClipboardList,
  Lightbulb, BarChart3, User, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wellness',  icon: Heart,           label: 'Wellness'  },
  { to: '/goals',     icon: Target,          label: 'Goals'     },
  { to: '/records',   icon: ClipboardList,   label: 'Records'   },
  { to: '/insights',  icon: Lightbulb,       label: 'Insights'  },
  { to: '/reports',   icon: BarChart3,       label: 'Reports'   },
  { to: '/profile',   icon: User,            label: 'Profile'   }
];

export default function Sidebar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <aside className="w-60 h-screen bg-surface dark:bg-dark-surface border-r border-border dark:border-dark-border flex flex-col shadow-card shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm text-ink-900 dark:text-ink-100 leading-tight">HealthTrack</h1>
            <p className="text-xs text-ink-400">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-primary text-white shadow-card'
                : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-dark-card hover:text-ink-900 dark:hover:text-ink-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-300'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border dark:border-dark-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-display font-bold text-sm">
              {profile?.name?.charAt(0) || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">{profile?.name || 'User'}</p>
            <p className="text-xs text-ink-400 truncate">
              {profile?.age ? `${profile.age}y` : ''}
              {profile?.age && profile?.bmi ? ' · ' : ''}
              {profile?.bmi ? `BMI ${profile.bmi}` : ''}
            </p>
          </div>
          <button onClick={handleLogout} className="text-ink-400 hover:text-heart transition-colors p-1 rounded-lg hover:bg-heart/10">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
