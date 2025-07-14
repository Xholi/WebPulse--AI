import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { 
  LayoutDashboard, 
  Building, 
  Wand2, 
  Palette, 
  Mail, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Users, 
  LogOut,
  Zap
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Business Leads", href: "/leads", icon: Building },
  { name: "Site Generator", href: "/generator", icon: Wand2 },
  { name: "Templates", href: "/templates", icon: Palette },
  { name: "Email Center", href: "/email", icon: Mail },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const accountNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Team", href: "/team", icon: Users },
  { name: "Logout", href: "/logout", icon: LogOut },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-border fixed h-full overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">WebPulse AI</h1>
            <p className="text-xs text-muted-foreground">v2.1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <button
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {item.name === "Business Leads" && (
                  <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                    42
                  </span>
                )}
              </button>
            </Link>
          );
        })}

        <div className="pt-4 border-t border-border mt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </div>
          {accountNavigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <button className="flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border mt-auto">
        <Button className="w-full brand-gradient text-white font-medium hover:opacity-90 transition-opacity">
          <Zap className="mr-2 w-4 h-4" />
          Generate New Site
        </Button>
      </div>
    </aside>
  );
}
