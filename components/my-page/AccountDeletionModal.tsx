import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AccountDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function AccountDeletionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: AccountDeletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원 탈퇴 확인</DialogTitle>
          <DialogDescription>
            정말로 회원 탈퇴를 진행하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '처리 중...' : '회원 탈퇴 확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 