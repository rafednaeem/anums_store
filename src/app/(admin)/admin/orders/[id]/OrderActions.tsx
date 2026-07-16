"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ORDER_STATUSES, ORDER_STATUS_TRANSITIONS } from "@/constants"
import type { OrderStatus } from "@/constants"
import { updateOrderStatus, verifyPayment, rejectPayment } from "@/lib/admin/actions"

interface OrderActionsProps {
  orderId: string
  currentStatus: string
  currentPaymentStatus: string
  hasPendingPayment: boolean
}

export function OrderActions({
  orderId,
  currentStatus,
  currentPaymentStatus,
  hasPendingPayment,
}: OrderActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const allowedTransitions =
    ORDER_STATUS_TRANSITIONS[currentStatus as OrderStatus] ?? []

  function handleStatusUpdate() {
    if (selectedStatus === currentStatus) return
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, selectedStatus)
        toast.success("Order status updated")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update")
      }
    })
  }

  function handleVerifyPayment() {
    startTransition(async () => {
      try {
        await verifyPayment(orderId)
        toast.success("Payment verified")
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to verify payment"
        console.error("[OrderActions] verifyPayment error:", err)
        toast.error(msg)
      }
    })
  }

  function handleRejectPayment() {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason")
      return
    }
    startTransition(async () => {
      try {
        await rejectPayment(orderId, rejectReason.trim())
        toast.success("Payment rejected")
        setRejectOpen(false)
        setRejectReason("")
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to reject payment"
        console.error("[OrderActions] rejectPayment error:", err)
        toast.error(msg)
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Update Status</label>
            <div className="flex gap-2">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={allowedTransitions.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentStatus}>
                    {currentStatus.replace(/_/g, " ")} (current)
                  </SelectItem>
                  {allowedTransitions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleStatusUpdate}
                disabled={
                  isPending || selectedStatus === currentStatus || allowedTransitions.length === 0
                }
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {hasPendingPayment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Verification</label>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleVerifyPayment}
                  disabled={isPending}
                  className="flex-1"
                >
                  Verify Payment
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRejectOpen(true)}
                  disabled={isPending}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Please provide a reason for rejecting this payment.
            </p>
            <Input
              placeholder="Rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false)
                setRejectReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={isPending || !rejectReason.trim()}
            >
              {isPending ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
