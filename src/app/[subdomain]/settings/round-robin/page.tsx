"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Users, 
  Settings,
  RotateCcw,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  GripVertical
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar?: string
  workload?: number
  orderPosition?: number
}

interface RoundRobinGroup {
  id: string
  name: string
  description?: string
  strategy: string
  skipUnavailable: boolean
  resetDaily: boolean
  memberOrder: string[]
  currentPosition: number
  lastAssignedAt?: string
  isActive: boolean
  members: User[]
  memberCount: number
}

export default function RoundRobinSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  
  const [groups, setGroups] = useState<RoundRobinGroup[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<RoundRobinGroup | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Form states
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    strategy: 'SEQUENTIAL',
    skipUnavailable: true,
    resetDaily: false
  })

  // Fetch round robin groups
  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/tasks/assign-round-robin`)
      if (!response.ok) throw new Error('Failed to fetch round robin groups')
      
      const data = await response.json()
      setGroups(data || [])
    } catch (error) {
      console.error('Error fetching round robin groups:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/${subdomain}/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    fetchGroups()
    fetchUsers()
  }, [])

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "SEQUENTIAL": return "bg-blue-100 text-blue-800"
      case "WEIGHTED": return "bg-green-100 text-green-800"
      case "SKILL_BASED": return "bg-purple-100 text-purple-800"
      case "AVAILABILITY_BASED": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case "SEQUENTIAL": return <ArrowUpDown className="h-4 w-4" />
      case "WEIGHTED": return <Target className="h-4 w-4" />
      case "SKILL_BASED": return <Users className="h-4 w-4" />
      case "AVAILABILITY_BASED": return <Clock className="h-4 w-4" />
      default: return <RotateCcw className="h-4 w-4" />
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Handle Create Group
  const handleCreateGroup = async () => {
    if (!newGroup.name || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/round-robin-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGroup,
          memberOrder: selectedMembers
        }),
      })

      if (!response.ok) throw new Error('Failed to create round robin group')

      // Reset form and close dialog
      setNewGroup({
        name: '',
        description: '',
        strategy: 'SEQUENTIAL',
        skipUnavailable: true,
        resetDaily: false
      })
      setSelectedMembers([])
      setIsCreateGroupOpen(false)
      
      // Refresh groups
      await fetchGroups()
      
      // Show success message
      alert('Round robin group created successfully!')
    } catch (error) {
      alert('Failed to create round robin group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Edit Group
  const handleEditGroup = async () => {
    if (!editingGroup || !editingGroup.name || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/round-robin-groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingGroup.name,
          description: editingGroup.description,
          strategy: editingGroup.strategy,
          skipUnavailable: editingGroup.skipUnavailable,
          resetDaily: editingGroup.resetDaily,
          memberOrder: selectedMembers
        }),
      })

      if (!response.ok) throw new Error('Failed to update round robin group')

      // Reset form and close dialog
      setEditingGroup(null)
      setSelectedMembers([])
      setIsEditGroupOpen(false)
      
      // Refresh groups
      await fetchGroups()
      
      // Show success message
      alert('Round robin group updated successfully!')
    } catch (error) {
      alert('Failed to update round robin group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete Group
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this round robin group?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/round-robin-groups/${groupId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete round robin group')
      
      // Refresh groups
      await fetchGroups()
      
      // Show success message
      alert('Round robin group deleted successfully!')
    } catch (error) {
      alert('Failed to delete round robin group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Toggle Group Status
  const handleToggleGroupStatus = async (groupId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/round-robin-groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      })

      if (!response.ok) throw new Error('Failed to update group status')
      
      // Refresh groups
      await fetchGroups()
    } catch (error) {
      alert('Failed to update group status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Reset Group Position
  const handleResetGroupPosition = async (groupId: string) => {
    if (!confirm('Are you sure you want to reset the position counter for this group?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/${subdomain}/round-robin-groups/${groupId}/reset`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to reset group position')
      
      // Refresh groups
      await fetchGroups()
      
      // Show success message
      alert('Group position reset successfully!')
    } catch (error) {
      alert('Failed to reset group position. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Open Edit Dialog
  const openEditDialog = (group: RoundRobinGroup) => {
    setEditingGroup(group)
    setSelectedMembers(group.members.map(m => m.id))
    setIsEditGroupOpen(true)
  }

  // Add member to selection
  const addMember = (userId: string) => {
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId])
    }
  }

  // Remove member from selection
  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId))
  }

  // Move member up in order
  const moveMemberUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...selectedMembers]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      setSelectedMembers(newOrder)
    }
  }

  // Move member down in order
  const moveMemberDown = (index: number) => {
    if (index < selectedMembers.length - 1) {
      const newOrder = [...selectedMembers]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      setSelectedMembers(newOrder)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Round Robin Settings</h1>
          <p className="text-muted-foreground">Configure automatic task assignment groups</p>
        </div>
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Round Robin Group</DialogTitle>
              <DialogDescription>Create a new group for automatic task assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Group Name *</Label>
                  <Input 
                    id="name" 
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy">Assignment Strategy</Label>
                  <Select value={newGroup.strategy} onValueChange={(value) => setNewGroup({...newGroup, strategy: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEQUENTIAL">Sequential</SelectItem>
                      <SelectItem value="WEIGHTED">Weighted (Load Balance)</SelectItem>
                      <SelectItem value="AVAILABILITY_BASED">Availability Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="Enter group description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skipUnavailable"
                    checked={newGroup.skipUnavailable}
                    onChange={(e) => setNewGroup({...newGroup, skipUnavailable: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="skipUnavailable">Skip unavailable users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resetDaily"
                    checked={newGroup.resetDaily}
                    onChange={(e) => setNewGroup({...newGroup, resetDaily: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="resetDaily">Reset position daily</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Group Members *</Label>
                  <p className="text-sm text-muted-foreground">Select users to include in this group</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Available Users</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                      {users
                        .filter(user => user.status === 'ACTIVE' && !selectedMembers.includes(user.id))
                        .map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => addMember(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Selected Members ({selectedMembers.length})</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                      {selectedMembers.map((userId, index) => {
                        const user = users.find(u => u.id === userId)
                        if (!user) return null
                        
                        return (
                          <div key={userId} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveMemberUp(index)}
                                disabled={index === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveMemberDown(index)}
                                disabled={index === selectedMembers.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUpDown className="h-3 w-3 rotate-180" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeMember(userId)}
                                className="h-6 w-6 p-0"
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={loading || selectedMembers.length === 0}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search round robin groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-64"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStrategyIcon(group.strategy)}
                    {group.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {group.description || 'No description'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(group)}
                    title="Edit Group"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(group.id)}
                    title="Delete Group"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className={getStrategyColor(group.strategy)}>
                  {group.strategy.replace('_', ' ')}
                </Badge>
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Members ({group.members.length})</h4>
                  <span className="text-xs text-muted-foreground">
                    Next: {group.members[group.currentPosition]?.name || 'None'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {group.members.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.workload || 0} active tasks
                          </div>
                        </div>
                      </div>
                      {index === group.currentPosition && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Next</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {group.members.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{group.members.length - 5} more members
                    </div>
                  )}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Skip unavailable</span>
                  {group.skipUnavailable ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Reset daily</span>
                  {group.resetDaily ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {group.lastAssignedAt && (
                  <div className="text-xs text-muted-foreground">
                    Last assigned: {new Date(group.lastAssignedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleGroupStatus(group.id, group.isActive)}
                  className="flex-1"
                >
                  {group.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResetGroupPosition(group.id)}
                  title="Reset Position"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Round Robin Groups</h3>
            <p className="text-muted-foreground mb-4">
              Create your first round robin group to enable automatic task assignment
            </p>
            <Button onClick={() => setIsCreateGroupOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Round Robin Group</DialogTitle>
            <DialogDescription>Update group settings and members</DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Group Name *</Label>
                  <Input 
                    id="edit-name" 
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({...editingGroup, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-strategy">Assignment Strategy</Label>
                  <Select value={editingGroup.strategy} onValueChange={(value) => setEditingGroup({...editingGroup, strategy: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEQUENTIAL">Sequential</SelectItem>
                      <SelectItem value="WEIGHTED">Weighted (Load Balance)</SelectItem>
                      <SelectItem value="AVAILABILITY_BASED">Availability Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({...editingGroup, description: e.target.value})}
                  placeholder="Enter group description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-skipUnavailable"
                    checked={editingGroup.skipUnavailable}
                    onChange={(e) => setEditingGroup({...editingGroup, skipUnavailable: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="edit-skipUnavailable">Skip unavailable users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-resetDaily"
                    checked={editingGroup.resetDaily}
                    onChange={(e) => setEditingGroup({...editingGroup, resetDaily: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="edit-resetDaily">Reset position daily</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Group Members *</Label>
                  <p className="text-sm text-muted-foreground">Select users to include in this group</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Available Users</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                      {users
                        .filter(user => user.status === 'ACTIVE' && !selectedMembers.includes(user.id))
                        .map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                            onClick={() => addMember(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Selected Members ({selectedMembers.length})</h4>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
                      {selectedMembers.map((userId, index) => {
                        const user = users.find(u => u.id === userId)
                        if (!user) return null
                        
                        return (
                          <div key={userId} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveMemberUp(index)}
                                disabled={index === 0}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveMemberDown(index)}
                                disabled={index === selectedMembers.length - 1}
                                className="h-6 w-6 p-0"
                              >
                                <ArrowUpDown className="h-3 w-3 rotate-180" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeMember(userId)}
                                className="h-6 w-6 p-0"
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGroup} disabled={loading || selectedMembers.length === 0}>
              {loading ? 'Updating...' : 'Update Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}