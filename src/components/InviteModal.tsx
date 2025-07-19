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

// Utility to detect iOS
const isIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export function InviteModal({ carpoolId, isOpen, onClose }: InviteModalProps) {
  console.log('[InviteModal] Rendered with carpoolId:', carpoolId, 'isOpen:', isOpen);
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
  const [showManualCopy, setShowManualCopy] = useState(isIOS());

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
    // Ensure error is always a string
    const safeValidation = {
      isValid: validation.isValid,
      error: typeof validation.error === 'string' ? validation.error : 'Invalid email address'
    }
    setEmailValidation(safeValidation)
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
      setError(typeof validation.error === 'string' ? validation.error : 'Please enter a valid email address')
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
    console.log('[InviteModal] handleCopyInviteLink called');
    setCopyStatus('loading');
    setCopiedLink(null);
    try {
      const result = await api.createOrFetchInviteLink(carpoolId);
      console.log('[InviteModal] Backend response:', result);
      const inviteCode = result.invite_code;
      console.log('[InviteModal] invite_code field:', inviteCode);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://carpooly.app';
      const inviteUrl = `${baseUrl}/invite/${inviteCode}`;
      console.log('[InviteModal] Constructed invite URL:', inviteUrl);
      setCopiedLink(inviteUrl);
      if (isIOS()) {
        setShowManualCopy(true);
        setCopyStatus('success');
        return;
      }
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus('success');
    } catch (err) {
      console.error('[InviteModal] Failed to copy invite link:', err);
      setCopyStatus('error');
      setShowManualCopy(true);
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
                {emailValidation.isValid ? '✓ Valid email address' : (typeof emailValidation.error === 'string' ? emailValidation.error : 'Invalid email address')}
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
          
          {/* iOS-specific warning */}
          {isIOS() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    iOS Device Detected
                  </p>
                  <p className="text-xs text-blue-700">
                    Due to iOS security restrictions, you'll need to manually copy the invite link. 
                    The link will appear in a text field below for you to copy.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end sm:items-center">
            <Button
              type="button"
              variant="secondary"
              onClick={e => { console.log('[InviteModal] Copy Invite Link button clicked'); handleCopyInviteLink(); }}
              disabled={copyStatus === 'loading' || isSubmitting}
              className={`min-w-[140px] ${isIOS() ? 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300' : ''}`}
            >
              {copyStatus === 'loading' ? 'Generating...' : copyStatus === 'success' ? (isIOS() ? 'Link Ready!' : 'Link Copied!') : (isIOS() ? 'Generate Link' : 'Copy Invite Link')}
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

          {/* Enhanced manual copy section for iOS */}
          {showManualCopy && copiedLink && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <Label htmlFor="manual-invite-link" className="text-sm font-medium text-gray-900">
                    {isIOS() ? 'Your Invite Link is Ready!' : 'Copy this link:'}
                  </Label>
                  {isIOS() && (
                    <p className="text-xs text-gray-600 mt-1">
                      Choose the easiest method below to copy your link
                    </p>
                  )}
                </div>
              </div>
              
              {/* Method 1: Easy Copy Button */}
              <div className="mb-3">
                <Button
                  onClick={() => {
                    const input = document.getElementById('manual-invite-link') as HTMLInputElement;
                    if (input) {
                      input.select();
                      input.setSelectionRange(0, input.value.length);
                      // Try to copy using clipboard API first
                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(copiedLink).then(() => {
                          // Show success feedback
                          const button = document.getElementById('easy-copy-btn');
                          if (button) {
                            const originalText = button.textContent;
                            button.textContent = 'Copied!';
                            button.className = 'w-full bg-green-100 hover:bg-green-200 text-green-800 border-green-300 text-sm font-medium py-2 px-4 rounded-md transition-colors';
                            setTimeout(() => {
                              button.textContent = originalText;
                              button.className = 'w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-sm font-medium py-2 px-4 rounded-md transition-colors';
                            }, 2000);
                          }
                        }).catch(() => {
                          // Fallback to manual selection
                          input.focus();
                          input.select();
                        });
                      } else {
                        // Fallback for non-secure contexts
                        input.focus();
                        input.select();
                      }
                    }
                  }}
                  id="easy-copy-btn"
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-sm font-medium py-2 px-4 rounded-md transition-colors"
                >
                  📋 Easy Copy (Tap Here)
                </Button>
              </div>

              {/* Method 2: Text Input with Better Selection */}
              <div className="mb-3">
                <Label htmlFor="manual-invite-link" className="text-xs font-medium text-gray-700 block mb-2">
                  Or manually select from here:
                </Label>
                <Input
                  id="manual-invite-link"
                  value={copiedLink}
                  readOnly
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.select();
                    target.setSelectionRange(0, target.value.length);
                  }}
                  onFocus={(e) => {
                    e.target.select();
                    e.target.setSelectionRange(0, e.target.value.length);
                  }}
                  className="text-xs font-mono bg-white border-2 border-blue-300 focus:border-blue-500 cursor-text"
                />
              </div>

              {/* Method 3: Tap to Copy Text */}
              <div className="mb-3">
                <Label className="text-xs font-medium text-gray-700 block mb-2">
                  Or tap this text to copy:
                </Label>
                <div
                  onClick={() => {
                    if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(copiedLink).then(() => {
                        const textDiv = document.getElementById('tap-to-copy-text');
                        if (textDiv) {
                          const originalText = textDiv.textContent;
                          textDiv.textContent = '✅ Copied!';
                          textDiv.className = 'p-3 bg-green-100 border-2 border-green-300 rounded-md text-xs font-mono break-all cursor-pointer text-green-800';
                          setTimeout(() => {
                            textDiv.textContent = originalText;
                            textDiv.className = 'p-3 bg-blue-100 border-2 border-blue-300 rounded-md text-xs font-mono break-all cursor-pointer text-blue-800 hover:bg-blue-200 transition-colors';
                          }, 2000);
                        }
                      });
                    }
                  }}
                  id="tap-to-copy-text"
                  className="p-3 bg-blue-100 border-2 border-blue-300 rounded-md text-xs font-mono break-all cursor-pointer text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {copiedLink}
                </div>
              </div>
              
              {isIOS() ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs font-bold">💡</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      <strong>Recommended:</strong> Use the "Easy Copy" button above - it's the fastest way!
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">📱</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      If the button doesn't work, tap the blue text box above to copy instantly
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-600 text-xs font-bold">⚙️</span>
                    </div>
                    <p className="text-xs text-gray-700">
                      Last resort: Tap the input field, then tap "Select All" → "Copy"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600 mt-2">
                  Tap and hold the link above to copy it, or use Ctrl+C (Cmd+C on Mac)
                </div>
              )}
            </div>
          )}

          {copyStatus === 'success' && copiedLink && !showManualCopy && (
            <div className="text-xs text-green-600 mt-2 break-all bg-green-50 p-2 rounded">
              ✅ Invite link copied to clipboard: <span className="font-mono">{copiedLink}</span>
            </div>
          )}
          {copyStatus === 'error' && (
            <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">
              ❌ Failed to copy invite link. Please try again or use the manual copy option above.
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
} 