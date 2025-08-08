"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Save,
  Edit,
  Calendar,
  Settings
} from "lucide-react"

interface AdminProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  is_verified: boolean
  avatar: string | null
  created_at: string
  updated_at: string
  phone: string | null
  location: string | null
  website: string | null
  social_links: string | null
  preferences: string | null
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    website: '',
    social_links: '',
    preferences: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    checkAdminAccess()
    loadAdminProfile()
  }, [])

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        window.location.href = '/login'
        return
      }

      const data = await response.json()
      if (data.user.role !== 'admin') {
        window.location.href = '/'
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      window.location.href = '/login'
    }
  }

  const loadAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.admin)
        setFormData({
          first_name: data.admin.first_name || '',
          last_name: data.admin.last_name || '',
          phone: data.admin.phone || '',
          location: data.admin.location || '',
          website: data.admin.website || '',
          social_links: data.admin.social_links || '',
          preferences: data.admin.preferences || ''
        })
      }
    } catch (error) {
      console.error('Load admin profile error:', error)
      toast({
        title: "Error",
        description: "Failed to load admin profile.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.admin)
        setEditing(false)
        toast({
          title: "Success",
          description: "Admin profile updated successfully."
        })
      }
    } catch (error) {
      console.error('Update admin profile error:', error)
      toast({
        title: "Error",
        description: "Failed to update admin profile.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Profile
          </h1>
          <p className="text-slate-600 mt-2">Manage your admin account settings and information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.first_name} {profile?.last_name}</h3>
                    <p className="text-slate-600">{profile?.email}</p>
                    <Badge variant="default" className="mt-1">
                      {profile?.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{profile.location}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{profile.website}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <span>Profile Settings</span>
                    </CardTitle>
                    <CardDescription>Update your admin profile information</CardDescription>
                  </div>
                  <Button
                    variant={editing ? "outline" : "default"}
                    onClick={() => setEditing(!editing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Enter location"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="Enter website URL"
                      />
                    </div>

                    <div>
                      <Label htmlFor="social_links">Social Links (JSON)</Label>
                      <Textarea
                        id="social_links"
                        value={formData.social_links}
                        onChange={(e) => setFormData({...formData, social_links: e.target.value})}
                        placeholder='{"twitter": "username", "linkedin": "profile-url"}'
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferences">Preferences (JSON)</Label>
                      <Textarea
                        id="preferences"
                        value={formData.preferences}
                        onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                        placeholder='{"theme": "dark", "notifications": true}'
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button onClick={updateProfile} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <div className="p-3 bg-slate-50 rounded-md border">
                          {profile?.first_name || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <div className="p-3 bg-slate-50 rounded-md border">
                          {profile?.last_name || 'Not set'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone Number</Label>
                        <div className="p-3 bg-slate-50 rounded-md border">
                          {profile?.phone || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <div className="p-3 bg-slate-50 rounded-md border">
                          {profile?.location || 'Not set'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Website</Label>
                      <div className="p-3 bg-slate-50 rounded-md border">
                        {profile?.website || 'Not set'}
                      </div>
                    </div>

                    <div>
                      <Label>Social Links</Label>
                      <div className="p-3 bg-slate-50 rounded-md border">
                        <pre className="text-xs text-slate-600 overflow-x-auto">
                          {profile?.social_links || 'Not set'}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <Label>Preferences</Label>
                      <div className="p-3 bg-slate-50 rounded-md border">
                        <pre className="text-xs text-slate-600 overflow-x-auto">
                          {profile?.preferences || 'Not set'}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 