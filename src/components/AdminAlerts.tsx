import { Bell, Check, X, AlertTriangle, Info, Filter, Search, Clock, Mail, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'payment' | 'system' | 'approval';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'system' | 'member' | 'financial' | 'security';
  actionRequired?: boolean;
}

export function AdminAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'action'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'success',
        title: 'Loan Application Approved',
        message: 'Loan application #L-2023-0015 for $5,000 has been approved for Jane Cooper.',
        date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        read: false,
        priority: 'high',
        category: 'financial',
        actionRequired: true
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Balance Alert',
        message: 'Group savings balance is below the recommended threshold of $10,000.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        priority: 'high',
        category: 'financial'
      },
      {
        id: '3',
        type: 'error',
        title: 'Payment Missed',
        message: 'Member #M-1005 has missed their scheduled payment of $250.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        read: false,
        priority: 'high',
        category: 'financial',
        actionRequired: true
      },
      {
        id: '4',
        type: 'info',
        title: 'New Feature Available',
        message: 'New reporting dashboard is now available. Check it out!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        priority: 'low',
        category: 'system'
      },
      {
        id: '5',
        type: 'payment',
        title: 'Payment Received',
        message: 'Received payment of $1,200 from John Smith for loan #L-2023-0010.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
        read: true,
        priority: 'medium',
        category: 'financial'
      },
      {
        id: '6',
        type: 'approval',
        title: 'Membership Request',
        message: 'New membership request from Alex Johnson is pending approval.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: false,
        priority: 'medium',
        category: 'member',
        actionRequired: true
      },
      {
        id: '7',
        type: 'system',
        title: 'Scheduled Maintenance',
        message: 'System maintenance scheduled for tomorrow at 2:00 AM EST.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        read: true,
        priority: 'medium',
        category: 'system'
      }
    ];

    setAlerts(mockAlerts);
  }, []);

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'approval':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; variant: string }> = {
      financial: { label: 'Financial', variant: 'outline' },
      member: { label: 'Member', variant: 'secondary' },
      system: { label: 'System', variant: 'default' },
      security: { label: 'Security', variant: 'destructive' }
    };
    
    const cat = categories[category] || { label: category, variant: 'outline' };
    return <Badge variant={cat.variant as any} className="text-xs">{cat.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      (activeTab === 'all') ||
      (activeTab === 'unread' && !alert.read) ||
      (activeTab === 'action' && alert.actionRequired);
    
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || alert.priority === selectedPriority;
    
    return matchesSearch && matchesTab && matchesCategory && matchesPriority;
  });

  const unreadCount = alerts.filter(a => !a.read).length;
  const actionRequiredCount = alerts.filter(a => a.actionRequired && !a.read).length;
  const categories = [...new Set(alerts.map(a => a.category))];
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
            {actionRequiredCount > 0 && ` • ${actionRequiredCount} require action`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-10 gap-1">
            <Mail className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Email Digest
            </span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 gap-1"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Check className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Mark all as read
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs 
              defaultValue="all" 
              className="w-full sm:w-auto"
              onValueChange={(value) => setActiveTab(value as any)}
            >
              <TabsList>
                <TabsTrigger value="all">All Alerts</TabsTrigger>
                <TabsTrigger value="unread">
                  <div className="flex items-center gap-2">
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger value="action">
                  <div className="flex items-center gap-2">
                    <span>Action Required</span>
                    {actionRequiredCount > 0 && (
                      <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
                        {actionRequiredCount}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search alerts..."
                className="w-full pl-8 sm:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filter by:</span>
            </div>
            
            <select
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
            
            {(selectedCategory !== 'all' || selectedPriority !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-sm text-muted-foreground"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                }}
              >
                Clear filters
                <X className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || selectedCategory !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : activeTab === 'all'
                    ? 'You\'re all caught up! No alerts to display.'
                    : activeTab === 'unread'
                      ? 'You have no unread alerts.'
                      : 'No action required at this time.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`flex items-start p-4 transition-colors hover:bg-muted/50 ${
                    !alert.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                      {getAlertIcon(alert.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 ml-3">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        !alert.read ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {alert.title}
                      </h4>
                      <div className="flex items-center gap-2 ml-2">
                        {alert.actionRequired && !alert.read && (
                          <Badge variant="outline" className="text-xs border-dashed">
                            Action Required
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(alert.date)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {getCategoryBadge(alert.category)}
                      {getPriorityBadge(alert.priority)}
                      {!alert.read && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {!alert.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          Mark as read
                        </Button>
                      )}
                      {alert.actionRequired && (
                        <Button size="sm" className="h-8 text-xs">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                          Take action
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Action Required
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">
              Needs your attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h 15m</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Resolved Today
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
