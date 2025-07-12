'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/services/api'
import { validateEmail } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'

interface InviteModalProps {
  carpoolId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteModal({ carpoolId, isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const api = useApi()
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setError('')
      setSuccess(false)
      setEmailValidation({ isValid: false })
      setHasInteracted(false)
    }
  }, [isOpen])

  // Real-time email validation
  useEffect(() => {
    if (email.trim() === '') {
      setEmailValidation({ isValid: false })
      return
    }

    const validation = validateEmail(email)
    setEmailValidation(validation)
  }, [email])

  // Fetch carpool members when modal opens
  useEffect(() => {
    if (isOpen && carpoolId) {
      api.getCarpoolMembers(carpoolId)
        .then((members) => setMembers(members || []))
        .catch(() => setMembers([]))
    } else {
      setMembers([])
    }
  }, [isOpen, carpoolId, api])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setHasInteracted(true)

    // Validate email before submission
    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid email address')
      return
    }

    // Check if email is already a member (case-insensitive)
    const emailLower = email.trim().toLowerCase()
    const isAlreadyMember = members.some(
      (m) => (m.email || '').toLowerCase() === emailLower
    )
    if (isAlreadyMember) {
      setError('This user is already a member of this carpool.')
      return
    }

    setIsSubmitting(true)
    try {
      // Check if carpool has available seats before sending invite
      const availability = await api.checkCarpoolAvailability(carpoolId)
      if (!availability.has_available_seats) {
        throw new Error('Cannot send invite: This carpool is full. No available seats.')
      }
      await api.inviteToCarpool(carpoolId, email.trim())
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000) // Close after 2 seconds on success
    } catch (error: any) {
      console.error('Error sending invite:', error)
      setError(error?.message || 'Failed to send invite')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setHasInteracted(true)
    // Clear error when user starts typing again
    if (error) setError('')
  }

  const getInputBorderColor = () => {
    if (!hasInteracted || email.trim() === '') return ''
    if (emailValidation.isValid) return 'border-green-500 focus:border-green-500'
    return 'border-red-500 focus:border-red-500'
  }

  const getInputIcon = () => {
    if (!hasInteracted || email.trim() === '') return <Mail className="w-4 h-4 text-gray-400" />
    if (emailValidation.isValid) return <CheckCircle className="w-4 h-4 text-green-500" />
    return <AlertCircle className="w-4 h-4 text-red-500" />
  }

  const handleCopyInviteLink = async () => {
    setCopyStatus('loading');
    setCopiedLink(null);
    try {
      const result = await api.createOrFetchInviteLink(carpoolId);
      const inviteCode = result.invite_code;
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://carpooly.app';
      const inviteUrl = `${baseUrl}/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(inviteUrl);
      setCopyStatus('success');
    } catch (err) {
      setCopyStatus('error');
    }
    setTimeout(() => setCopyStatus('idle'), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Invite to Carpool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={handleEmailChange}
                required
                className={`pr-10 ${getInputBorderColor()}`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {getInputIcon()}
              </div>
            </div>
            {/* Real-time validation feedback */}
            {hasInteracted && email.trim() !== '' && (
              <div className={`text-xs ${emailValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {emailValidation.isValid ? '✓ Valid email address' : emailValidation.error}
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  {error}
                  {error.includes('not registered') && (
                    <div className="mt-2">
                      <a 
                        href="https://carpooly.app/sign-up" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Create an account →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Invite sent successfully!</strong>
                  <p className="text-xs text-green-700 mt-1">
                    The user will receive an email invitation to join your carpool.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end sm:items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCopyInviteLink}
              disabled={copyStatus === 'loading' || isSubmitting}
              className="min-w-[140px]"
            >
              {copyStatus === 'loading' ? 'Generating...' : copyStatus === 'success' ? 'Link Copied!' : 'Copy Invite Link'}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !emailValidation.isValid || email.trim() === ''}
                className="min-w-[100px]"
              >
                {isSubmitting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
          {copyStatus === 'success' && copiedLink && (
            <div className="text-xs text-green-600 mt-2 break-all">Invite link copied: <span className="font-mono">{copiedLink}</span></div>
          )}
          {copyStatus === 'error' && (
            <div className="text-xs text-red-600 mt-2">Failed to copy invite link. Please try again.</div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 