import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Trash2, Users as UsersIcon, Bell, Download, Plus, MoreVertical, Filter, Check, X, 
  ChevronUp, ChevronDown, ArrowUpDown, Mail, Loader2, AlertCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Custom Button component to replace shadcn Button
const Button = ({ 
  variant = 'default', 
  size = 'default',
  className = '',
  children,
  ...props 
}: {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md text-xs',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input component
const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  totalSavings: number;
  loans: number;
  rating: number;
}

export function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    id: number | null;
    name: string;
    type: 'request' | 'member';
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    id: number | null;
    name: string;
  } | null>(null);
  const [notifyModal, setNotifyModal] = useState<{
    show: boolean;
    id: number | null;
    name: string;
    email: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'name', 
    direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedMembers = JSON.parse(localStorage.getItem('safe_save_approved_members') || '[]');
        if (Array.isArray(storedMembers)) {
          setGroupMembers(storedMembers);
        }

        const storedPending = JSON.parse(localStorage.getItem('safe_save_pending_requests') || '[]');
        if (Array.isArray(storedPending)) {
          setPendingRequests(storedPending);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load member data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: number) => {
    const request = pendingRequests.find((r) => r.id === id);
    if (!request) return;

    const newMember: Member = {
      id,
      name: request.name,
      email: request.email,
      phone: request.phone || '',
      joinDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'active',
      totalSavings: 0,
      loans: 0,
      rating: 0,
    };

    const updatedMembers = [...groupMembers, newMember];
    setGroupMembers(updatedMembers);
    localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));

    const updatedPending = pendingRequests.filter((r) => r.id !== id);
    setPendingRequests(updatedPending);
    localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));

    toast.success('Member approved', {
      description: `${request.name} has been added to the group.`,
    });
  };

  const handleRejectWithReason = () => {
    if (!rejectModal) return;

    if (rejectModal.type === 'request') {
      const request = pendingRequests.find((r) => r.id === rejectModal.id);
      const updatedPending = pendingRequests.filter((r) => r.id !== rejectModal.id);
      setPendingRequests(updatedPending);
      localStorage.setItem('safe_save_pending_requests', JSON.stringify(updatedPending));
      
      toast.error('Request rejected', {
        description: request 
          ? `${request.name}'s request has been rejected.` 
          : 'Request rejected',
      });
    } else {
      const member = groupMembers.find((m) => m.id === rejectModal.id);
      const updatedMembers = groupMembers.filter((m) => m.id !== rejectModal.id);
      setGroupMembers(updatedMembers);
      localStorage.setItem('safe_save_approved_members', JSON.stringify(updatedMembers));
      
      toast.error('Member removed', {
        description: member 
          ? `${member.name} has been removed from the group.` 
          : 'Member removed',
      });
    }

    setRejectModal(null);
    setRejectReason('');
  };

  const handleNotify = () => {
    if (!notifyModal) return;
    
    toast.success('Notification sent', {
      description: `Message sent to ${notifyModal.name}.`,
    });
    
    setNotifyModal(null);
    setNotificationMessage('');
  };

  const filteredMembers = useMemo(() => {
    let result = [...groupMembers];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.phone?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((member) => member.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Member];
        const bValue = b[sortConfig.key as keyof Member];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [groupMembers, searchTerm, statusFilter, sortConfig]);

  // Pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4" /> 
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-gray-500">
            Manage and view all members in the system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
          </Button>
          <Button size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Member</span>
          </Button>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
          <h3 className="text-lg font-medium text-amber-800 mb-3">Pending Approval ({pendingRequests.length})</h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                <div>
                  <p className="font-medium">{request.name}</p>
                  <p className="text-sm text-gray-500">{request.email}</p>
                  {request.phone && <p className="text-sm text-gray-500">{request.phone}</p>}
                  <p className="text-xs text-amber-600 mt-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Requested {new Date(request.requestDate || new Date()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setRejectModal({
                        show: true,
                        id: request.id,
                        name: request.name,
                        type: 'request'
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search members..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                className="h-10 rounded-md border border-gray-300 bg-white pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'joinDate', label: 'Join Date' },
                  { key: 'status', label: 'Status' },
                  { key: 'totalSavings', label: 'Savings' },
                  { key: 'actions', label: 'Actions' },
                ].map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.key !== 'actions' && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.key !== 'actions' && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMembers.length > 0 ? (
                currentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-10 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">ID: {member.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(member.totalSavings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setNotifyModal({
                              show: true,
                              id: member.id,
                              name: member.name,
                              email: member.email
                            });
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Send Message"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRejectModal({
                              show: true,
                              id: member.id,
                              name: member.name,
                              type: 'member'
                            });
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UsersIcon className="h-12 w-12 text-gray-300" />
                      <p>No members found</p>
                      {searchTerm && (
                        <p className="text-sm">
                          No members match your search criteria. Try a different search term.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstMember + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastMember, filteredMembers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredMembers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">First</span>
                    <ChevronUp className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                  </button>
                  <div className="flex items-center px-4">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Last</span>
                    <ChevronDown className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject/Delete Modal */}
      {(rejectModal?.show || deleteModal?.show) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {rejectModal?.type === 'request' ? 'Reject Request' : 'Remove Member'}
                </h3>
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setDeleteModal(null);
                    setRejectReason('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {rejectModal?.type === 'request' 
                    ? `Are you sure you want to reject ${rejectModal?.name}'s request?`
                    : `Are you sure you want to remove ${deleteModal?.name} from the group?`}
                </p>
                
                <div>
                  <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason (optional)
                  </label>
                  <textarea
                    id="rejectReason"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(null);
                    setDeleteModal(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectWithReason}
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {rejectModal?.type === 'request' ? 'Reject Request' : 'Remove Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {notifyModal?.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Send Message to {notifyModal?.name}
                </h3>
                <button
                  onClick={() => {
                    setNotifyModal(null);
                    setNotificationMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="notificationMessage"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Type your message here..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setNotifyModal(null);
                    setNotificationMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNotify}
                  disabled={!notificationMessage.trim()}
                  className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}