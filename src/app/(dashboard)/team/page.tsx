'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  MoreVertical,
  Clock,
  FileText,
  Mic,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

interface Member {
  id: number;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  lastActive: string;
  isOnline: boolean;
  initials: string;
}



export default function TeamWorkspacePage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [newComment, setNewComment] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('workspace_owner_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleInvite = useCallback(async () => {
    if (!inviteEmail.trim() || !user) return;
    setIsInviting(true); setInviteError('');
    try {
      const { error } = await supabase.from('team_members').insert([{
        workspace_owner_id: user.id,
        email: inviteEmail.trim(),
        role: inviteRole.toLowerCase(),
        status: 'pending',
      }]);
      if (error) throw error;
      await loadMembers();
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err: any) { setInviteError(err.message); }
    finally { setIsInviting(false); }
  }, [inviteEmail, inviteRole, user, loadMembers]);

  const handleRemoveMember = useCallback(async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await supabase.from('team_members').delete().eq('id', id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (err: any) { console.error(err); }
  }, []);

  return (
    <div className="min-h-screen bg-[#0e1417] text-[#dde4e6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a2123] rounded-lg">
              <Users className="w-6 h-6 text-[#aeecff]" />
            </div>
            <h1 className="text-3xl font-bold">Team Workspace</h1>
          </div>

          <Button
            onClick={() => setShowInviteModal(true)}
            className="bg-[#aeecff] text-[#0e1417] hover:bg-[#00d8ff]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Members Table - Desktop */}
        <Card className="bg-[#131c1f] border-[#3c494d] mb-8 hidden md:block">
          <CardHeader>
            <CardTitle className="text-[#dde4e6]">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3c494d]">
                    <th className="text-left py-3 px-4 text-[#859398] font-medium">
                      Member
                    </th>
                    <th className="text-left py-3 px-4 text-[#859398] font-medium">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-[#859398] font-medium">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-[#859398] font-medium">
                      Last Active
                    </th>
                    <th className="text-left py-3 px-4 text-[#859398] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#3c494d]/50 hover:bg-[#1a2123] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#aeecff] to-[#00d8ff] flex items-center justify-center text-[#0e1417] font-semibold">
                              {member.initials}
                            </div>
                            {member.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#131c1f]" />
                            )}
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#859398]">
                        {member.email}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={cn('border', roleColors[member.role])}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-[#859398]">
                        {member.lastActive}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {member.role !== 'Owner' && (
                            <>
                              <button className="p-1 hover:bg-[#242b2d] rounded text-[#859398] hover:text-[#aeecff] transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Members Cards - Mobile */}
        <div className="md:hidden space-y-4 mb-8">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-[#131c1f] border-[#3c494d]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#aeecff] to-[#00d8ff] flex items-center justify-center text-[#0e1417] font-semibold">
                          {member.initials}
                        </div>
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#131c1f]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-[#859398]">{member.email}</p>
                      </div>
                    </div>
                    {member.role !== 'Owner' && (
                      <button className="p-1 hover:bg-[#242b2d] rounded text-[#859398]">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={cn('border', roleColors[member.role])}>
                      {member.role}
                    </Badge>
                    <span className="text-sm text-[#859398]">
                      {member.lastActive}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Feed */}
          <Card className="bg-[#131c1f] border-[#3c494d]">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#aeecff] to-[#00d8ff] flex items-center justify-center text-[#0e1417] text-xs font-semibold flex-shrink-0">
                      {activity.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        <span className="text-[#859398]">{activity.action}</span>
                      </p>
                      <p className="text-xs text-[#859398] mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="bg-[#131c1f] border-[#3c494d]">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-[#1a2123] rounded-lg border border-[#3c494d]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium mb-1">{approval.project}</h4>
                        <p className="text-sm text-[#859398]">
                          Requested by {approval.requestedBy}
                        </p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        {approval.type}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout - Projects and Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shared Projects */}
          <Card className="bg-[#131c1f] border-[#3c494d]">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">Shared Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-[#1a2123] rounded-lg border border-[#3c494d] hover:border-[#aeecff]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{project.name}</h4>
                      <FileText className="w-4 h-4 text-[#859398]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.members.map((initials, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#aeecff] to-[#00d8ff] flex items-center justify-center text-[#0e1417] text-xs font-semibold border-2 border-[#1a2123]"
                          >
                            {initials}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-[#859398]">
                        {project.updated}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Comments */}
          <Card className="bg-[#131c1f] border-[#3c494d]">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">Project Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#aeecff] to-[#00d8ff] flex items-center justify-center text-[#0e1417] text-xs font-semibold flex-shrink-0">
                      {comment.initials}
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#1a2123] rounded-lg p-3">
                        <p className="font-medium text-sm mb-1">{comment.user}</p>
                        <p className="text-sm text-[#dde4e6]">{comment.text}</p>
                      </div>
                      <p className="text-xs text-[#859398] mt-1 ml-3">
                        {comment.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-[#1a2123] border-[#3c494d] text-[#dde4e6] placeholder:text-[#859398]"
                />
                <Button className="bg-[#aeecff] text-[#0e1417] hover:bg-[#00d8ff]">
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
        <div className="bg-[#131c1f] border border-[#3c494d] rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-[#dde4e6]">
            Invite Team Member
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#859398]">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-[#1a2123] border-[#3c494d] text-[#dde4e6] placeholder:text-[#859398]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#859398]">
                Role
              </label>
              <div className="space-y-2">
                {(['Admin', 'Editor', 'Viewer'] as const).map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-3 p-3 bg-[#1a2123] rounded-lg border border-[#3c494d] hover:border-[#aeecff]/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={inviteRole === role}
                      onChange={(e) =>
                        setInviteRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')
                      }
                      className="accent-[#aeecff]"
                    />
                    <span className="text-[#dde4e6]">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowInviteModal(false)}
              className="flex-1 bg-[#1a2123] text-[#dde4e6] border border-[#3c494d] hover:bg-[#242b2d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              className="flex-1 bg-[#aeecff] text-[#0e1417] hover:bg-[#00d8ff]"
            >
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
