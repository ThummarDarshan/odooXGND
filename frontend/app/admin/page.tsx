"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserCheck, UserX, Shield, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { Navigation } from "@/components/navigation";

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  is_enabled: boolean;
  reactivation_requested?: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filtered, setFiltered] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserType | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [reactivationRequests, setReactivationRequests] = useState<UserType[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const pageSize = 8;
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const userMgmtRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      try {
        const res = await fetch("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!data.user || data.user.role !== "admin") {
          window.location.href = "/";
          return;
        }
        await fetchUsers(token);
        await fetchReactivationRequests(token);
      } catch {
        setError("Failed to authenticate. Please try again.");
        setLoading(false);
      }
    };
    checkAdminAccess();
  }, []);

  useEffect(() => {
    let filteredUsers = users;
    if (roleFilter !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
    }
    if (statusFilter === "enabled") {
      filteredUsers = filteredUsers.filter((u) => u.is_enabled);
    } else if (statusFilter === "disabled") {
      filteredUsers = filteredUsers.filter((u) => !u.is_enabled);
    }
    if (verifiedFilter === "verified") {
      filteredUsers = filteredUsers.filter((u) => u.is_verified);
    } else if (verifiedFilter === "unverified") {
      filteredUsers = filteredUsers.filter((u) => !u.is_verified);
    }
    if (search) {
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.first_name.toLowerCase().includes(search.toLowerCase()) ||
          u.last_name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(filteredUsers);
    setPage(1);
  }, [search, users, roleFilter, statusFilter, verifiedFilter]);

  const fetchUsers = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch {
      setError("Failed to load users. Please try again.");
      setLoading(false);
    }
  };

  const toggleUserEnabled = async (user: UserType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${user.id}/enable`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_enabled: !user.is_enabled }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_enabled: !u.is_enabled } : u
          )
        );
      }
    } catch {}
  };

  const toggleUserVerified = async (user: UserType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${user.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_verified: !user.is_verified }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_verified: !u.is_verified } : u
          )
        );
      }
    } catch {}
  };

  const promoteDemote = async (user: UserType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: user.role === "admin" ? "user" : "admin" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, role: user.role === "admin" ? "user" : "admin" } : u
          )
        );
      }
    } catch {}
  };

  const fetchReactivationRequests = async (token: string) => {
    setLoadingRequests(true);
    try {
      const res = await fetch("http://localhost:5001/api/admin/reactivation-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reactivation requests");
      const data = await res.json();
      setReactivationRequests(data.requests || []);
      setLoadingRequests(false);
    } catch {
      setError("Failed to load reactivation requests. Please try again.");
      setLoadingRequests(false);
    }
  };

  const approveReactivation = async (user: UserType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/reactivation-requests/${user.id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReactivationRequests((prev) => prev.filter((u) => u.id !== user.id));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, is_enabled: true, reactivation_requested: false } : u
          )
        );
      }
    } catch {}
  };

  const rejectReactivation = async (user: UserType) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/admin/reactivation-requests/${user.id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReactivationRequests((prev) => prev.filter((u) => u.id !== user.id));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, reactivation_requested: false } : u
          )
        );
      }
    } catch {}
  };

  const total = users.length;
  const admins = users.filter((u) => u.role === "admin").length;
  const enabled = users.filter((u) => u.is_enabled).length;
  const disabled = users.filter((u) => !u.is_enabled).length;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="shadow-sm border border-border bg-card cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 hover:scale-105" 
            onClick={() => { 
              setRoleFilter("all"); 
              setStatusFilter("all"); 
              setVerifiedFilter("all"); 
              userMgmtRef.current?.scrollIntoView({ behavior: 'smooth' }); 
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <User className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{total}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view all users</p>
            </CardContent>
          </Card>
          <Card 
            className="shadow-sm border border-border bg-card cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200 hover:scale-105" 
            onClick={() => { 
              setRoleFilter("admin"); 
              setStatusFilter("all"); 
              setVerifiedFilter("all"); 
              userMgmtRef.current?.scrollIntoView({ behavior: 'smooth' }); 
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              <Shield className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{admins}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view admins</p>
            </CardContent>
          </Card>
          <Card 
            className="shadow-sm border border-border bg-card cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 hover:scale-105" 
            onClick={() => { 
              setStatusFilter("enabled"); 
              setRoleFilter("all"); 
              setVerifiedFilter("all"); 
              userMgmtRef.current?.scrollIntoView({ behavior: 'smooth' }); 
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
              <UserCheck className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{enabled}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view enabled users</p>
            </CardContent>
          </Card>
          <Card 
            className="shadow-sm border border-border bg-card cursor-pointer hover:shadow-md hover:border-red-300 transition-all duration-200 hover:scale-105" 
            onClick={() => { 
              setStatusFilter("disabled"); 
              setRoleFilter("all"); 
              setVerifiedFilter("all"); 
              userMgmtRef.current?.scrollIntoView({ behavior: 'smooth' }); 
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disabled</CardTitle>
              <UserX className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{disabled}</div>
              <p className="text-xs text-muted-foreground mt-1">Click to view disabled users</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="shadow border border-border bg-card" ref={userMgmtRef}>
          <CardHeader className="border-b border-border pb-4 mb-4">
            <div className="flex flex-col gap-4">
              <CardTitle className="text-lg font-semibold text-foreground">User Management</CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-border focus:border-blue-400 focus:ring-blue-200 bg-background"
                    />
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px] border-border bg-background">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] border-border bg-background">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                    <SelectTrigger className="w-[140px] border-border bg-background">
                      <SelectValue placeholder="Verified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Verification</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Filters Button */}
                  {(roleFilter !== "all" || statusFilter !== "all" || verifiedFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRoleFilter("all");
                        setStatusFilter("all");
                        setVerifiedFilter("all");
                      }}
                      className="border-border text-muted-foreground hover:bg-muted"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(roleFilter !== "all" || statusFilter !== "all" || verifiedFilter !== "all") && (
                <div className="flex flex-wrap gap-2">
                  {roleFilter !== "all" && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Role: {roleFilter}
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Status: {statusFilter}
                    </Badge>
                  )}
                  {verifiedFilter !== "all" && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Verification: {verifiedFilter}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : error ? (
              <div className="text-center text-destructive">{error}</div>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full bg-card">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/5">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/8">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/8">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/8">Enabled</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <User className="h-8 w-8 text-muted-foreground" />
                              <span className="text-sm">No users found matching your criteria.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paged.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-muted transition-colors duration-150 cursor-pointer group"
                            onClick={(e) => {
                              // Prevent row click if a button inside the row is clicked
                              if ((e.target as HTMLElement).closest('button')) return;
                              setSelected(user);
                              setShowDialog(true);
                            }}
                          >
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground group-hover:text-blue-600 transition-colors">
                                  {user.first_name} {user.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-foreground break-all">{user.email}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Badge
                                variant={user.role === "admin" ? "default" : "secondary"}
                                className={`${user.role === "admin" 
                                  ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700" 
                                  : "bg-muted text-muted-foreground border-border"
                                } text-xs font-medium px-2 py-1`}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Badge
                                variant={user.is_verified ? "default" : "destructive"}
                                className={`${user.is_verified 
                                  ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700" 
                                  : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700"
                                } text-xs font-medium px-2 py-1`}
                              >
                                {user.is_verified ? "Verified" : "Unverified"}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <Badge
                                variant={user.is_enabled ? "default" : "destructive"}
                                className={`${user.is_enabled 
                                  ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700" 
                                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                } text-xs font-medium px-2 py-1`}
                              >
                                {user.is_enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2 justify-center items-center">
                                {/* Primary Actions */}
                                <div className="flex flex-col xs:flex-row gap-1.5 w-full justify-center">
                                  <Button
                                    size="sm"
                                    variant={user.is_enabled ? "destructive" : "default"}
                                    className={`min-h-[32px] px-2 sm:px-3 text-[10px] xs:text-xs sm:text-sm font-medium ${
                                      user.is_enabled 
                                        ? "bg-red-500 hover:bg-red-600 text-white" 
                                        : "bg-green-500 hover:bg-green-600 text-white"
                                    } w-full xs:w-auto`}
                                    onClick={() => toggleUserEnabled(user)}
                                  >
                                    {user.is_enabled ? "Disable" : "Enable"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={user.is_verified ? "destructive" : "default"}
                                    className={`min-h-[32px] px-2 sm:px-3 text-[10px] xs:text-xs sm:text-sm font-medium ${
                                      user.is_verified 
                                        ? "bg-orange-500 hover:bg-orange-600 text-white" 
                                        : "bg-blue-500 hover:bg-blue-600 text-white"
                                    } w-full xs:w-auto`}
                                    onClick={() => toggleUserVerified(user)}
                                  >
                                    {user.is_verified ? "Unverify" : "Verify"}
                                  </Button>
                                </div>
                                
                                {/* Secondary Actions */}
                                <div className="flex flex-col xs:flex-row gap-1.5 w-full justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="min-h-[32px] px-2 sm:px-3 text-[10px] xs:text-xs sm:text-sm font-medium border-border text-muted-foreground hover:bg-muted w-full xs:w-auto"
                                    onClick={() => promoteDemote(user)}
                                  >
                                    {user.role === "admin" ? "Demote" : "Promote"}
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-border"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-border"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Reactivation Requests */}
        {reactivationRequests.length > 0 && (
          <Card className="shadow border border-border bg-card mt-6">
            <CardHeader className="border-b border-border pb-4 mb-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Reactivation Requests ({reactivationRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full bg-card">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Email</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/6">Role</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/6">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reactivationRequests.map((user) => (
                        <tr key={user.id} className="hover:bg-muted transition-colors duration-150">
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {user.first_name} {user.last_name}
                              </span>
                              <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-foreground break-all">{user.email}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className={`${user.role === "admin" 
                                ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700" 
                                : "bg-muted text-muted-foreground border-border"
                              } text-xs font-medium px-2 py-1`}
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              variant="destructive"
                              className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700 text-xs font-medium px-2 py-1"
                            >
                              Reactivation Requested
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1.5 justify-center items-center">
                              <div className="flex flex-col xs:flex-row gap-1.5 w-full justify-center">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="min-h-[32px] px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm font-medium bg-green-500 hover:bg-green-600 text-white w-full xs:w-auto"
                                  onClick={() => approveReactivation(user)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="min-h-[32px] px-2 sm:px-4 text-[10px] xs:text-xs sm:text-sm font-medium bg-red-500 hover:bg-red-600 text-white w-full xs:w-auto"
                                  onClick={() => rejectReactivation(user)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name: </span>
                {selected.first_name} {selected.last_name}
              </div>
              <div>
                <span className="font-semibold">Email: </span>
                {selected.email}
              </div>
              <div>
                <span className="font-semibold">Role: </span>
                {selected.role}
              </div>
              <div>
                <span className="font-semibold">Verified: </span>
                {selected.is_verified ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Enabled: </span>
                {selected.is_enabled ? "Yes" : "No"}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  size="sm"
                  variant={selected.is_enabled ? "destructive" : "default"}
                  className={`min-h-[32px] px-3 text-xs font-medium ${
                    selected.is_enabled 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } w-full sm:w-auto`}
                  onClick={() => toggleUserEnabled(selected)}
                >
                  {selected.is_enabled ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant={selected.is_verified ? "destructive" : "default"}
                  className={`min-h-[32px] px-3 text-xs font-medium ${
                    selected.is_verified 
                      ? "bg-orange-500 hover:bg-orange-600 text-white" 
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  } w-full sm:w-auto`}
                  onClick={() => toggleUserVerified(selected)}
                >
                  {selected.is_verified ? "Unverify" : "Verify"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => promoteDemote(selected)}
                  className="min-h-[32px] px-3 text-xs font-medium border-border text-muted-foreground hover:bg-muted w-full sm:w-auto"
                >
                  {selected.role === "admin" ? "Demote" : "Promote"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 