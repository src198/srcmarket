"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  ArrowLeft,
  X,
  Clock,
  User,
  Shield,
  Loader2,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Tag,
  Users,
  BarChart3,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type TabType = "usernames" | "badges"
type SortType = "price-asc" | "price-desc" | "newest" | "popular"

interface Seller {
  id: number
  username: string
  name: string
  photo?: string
  avatar_url?: string
  is_verified?: boolean
}

interface Listing {
  id: number
  username: string
  price: number
  seller_id: number
  seller: Seller
  buyer_id: number | null
  buyer: Seller | null
  status: string
  created_at: string
  updated_at: string
  sold_at: string | null
  purchase_url?: string
}

interface BadgePurchase {
  buyer_id: number
  buyer: Seller
  purchase_date: string
}

interface BadgeItem {
  id: number
  name: string
  description: string
  image_path: string
  price: number
  creator_id: number
  creator: Seller
  copies_sold: number
  max_copies: number
  is_sold_out: boolean
  upgrade?: string
  color_upgrade?: string
  purchases: BadgePurchase[]
  purchase_url?: string
}

interface OwnershipRecord {
  timestamp: string
  price: number
  buyer_id: number
  buyer_username: string
  seller_id: number | null
  seller_username: string
}

interface HistoryData {
  username: string
  current_owner: {
    id: number
    username: string
    name: string
  }
  ownership_history: OwnershipRecord[]
  users: Record<string, Seller>
}

interface CartItem {
  type: "username" | "badge"
  id: number
  name: string
  price: number
  image?: string
  purchase_url?: string
}

const API_IMAGE_BASE = "https://k-connect.ru"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " b"
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatDateFull(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function MarketStats({
  usernameCount,
  badgeCount,
  totalValue,
  trendingCount,
}: {
  usernameCount: number
  badgeCount: number
  totalValue: number
  trendingCount: number
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Tag className="h-4 w-4" />
          <span className="text-xs">Юзернеймов</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{usernameCount}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs">Бейджиков</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{badgeCount}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs">Общая стоимость</span>
        </div>
        <p className="text-2xl font-bold text-primary">{formatPrice(totalValue)}</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs">В тренде</span>
        </div>
        <p className="text-2xl font-bold text-foreground">{trendingCount}</p>
      </div>
    </div>
  )
}

function UsernameCard({
  listing,
  onClick,
  onAddToCart,
  isInCart,
}: {
  listing: Listing
  onClick: () => void
  onAddToCart: () => void
  isInCart: boolean
}) {
  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <button
        onClick={onClick}
        type="button"
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-border">
            <AvatarImage
              src={listing.seller.photo || listing.seller.avatar_url || "/placeholder.svg"}
              alt={listing.seller.name}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {listing.seller.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">Продавец</p>
            <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
              {listing.seller.name}
              {listing.seller.is_verified && (
                <Shield className="h-3 w-3 text-primary" />
              )}
            </p>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
            @{listing.username}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {listing.username.length} символов
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(listing.price)}
          </span>
        </div>
      </button>

      <div className="px-4 pb-4 pt-0 flex gap-2">
        <Button
          size="sm"
          variant={isInCart ? "secondary" : "outline"}
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart()
          }}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {isInCart ? "В корзине" : "В корзину"}
        </Button>
      </div>
    </div>
  )
}

// Badge Card
function BadgeCard({
  badge,
  onClick,
  onAddToCart,
  isInCart,
}: {
  badge: BadgeItem
  onClick: () => void
  onAddToCart: () => void
  isInCart: boolean
}) {
  const progress = badge.max_copies > 0 ? (badge.copies_sold / badge.max_copies) * 100 : 0

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <button
        onClick={onClick}
        type="button"
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: badge.color_upgrade
                ? `${badge.color_upgrade}20`
                : "var(--secondary)",
            }}
          >
            {badge.image_path ? (
              <img
                src={`${API_IMAGE_BASE}/static/uploads/badges/${badge.image_path}`}
                alt={badge.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <Sparkles
                className="h-8 w-8"
                style={{ color: badge.color_upgrade || "var(--primary)" }}
              />
            )}
            {badge.upgrade && (
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {badge.upgrade}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {badge.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {badge.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={badge.creator.avatar_url || badge.creator.photo || "/placeholder.svg"}
              alt={badge.creator.name}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {badge.creator.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {badge.creator.name}
          </span>
        </div>

        {badge.max_copies > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Продано {badge.copies_sold} из {badge.max_copies}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(badge.price)}
          </span>
          {badge.is_sold_out && (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
              Распродано
            </Badge>
          )}
        </div>
      </button>

      <div className="px-4 pb-4 pt-0 flex gap-2">
        <Button
          size="sm"
          variant={isInCart ? "secondary" : "outline"}
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart()
          }}
          disabled={badge.is_sold_out}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {isInCart ? "В корзине" : "В корзину"}
        </Button>
      </div>
    </div>
  )
}

function UsernameModal({
  listing,
  onClose,
}: {
  listing: Listing
  onClose: () => void
}) {
  const [history, setHistory] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch(`/api/history/${listing.username}`)
        const data = await response.json()
        if (data.success) {
          setHistory(data.data)
        }
      } catch (error) {
        console.error("[v0] Error fetching history:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [listing.username])

  const handleBuy = () => {
    if (listing.purchase_url) {
      window.open(listing.purchase_url, "_blank")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            @{listing.username}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <span className="text-3xl font-bold text-primary">@</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {listing.username}
            </h1>
            <p className="text-sm text-muted-foreground mb-2">
              {listing.username.length} символов
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Продавец
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage
                  src={listing.seller.photo || listing.seller.avatar_url || "/placeholder.svg"}
                  alt={listing.seller.name}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {listing.seller.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  {listing.seller.name}
                  {listing.seller.is_verified && (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{listing.seller.username}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Создано</p>
              <p className="text-sm text-foreground">
                {formatDateFull(listing.created_at)}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              История владения
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history?.ownership_history && history.ownership_history.length > 0 ? (
              <div className="space-y-2">
                {history.ownership_history.map((record, index) => {
                  const buyer = history.users[record.buyer_id]
                  return (
                    <div
                      key={`${record.timestamp}-${index}`}
                      className="bg-secondary/50 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {buyer ? (
                            <>
                              <Avatar className="h-7 w-7">
                                <AvatarImage
                                  src={buyer.photo || buyer.avatar_url || "/placeholder.svg"}
                                  alt={buyer.name}
                                />
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                  {buyer.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground">
                                {buyer.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="h-7 w-7 p-1.5 bg-secondary rounded-full text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {record.buyer_username}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(record.price)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(record.timestamp)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-secondary/30 rounded-xl">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">История отсутствует</p>
              </div>
            )}
          </div>

          {listing.status === "active" && (
            <Button
              onClick={handleBuy}
              className="w-full h-12 text-base font-semibold"
            >
              Купить за {formatPrice(listing.price)}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function BadgeModal({
  badge,
  onClose,
}: {
  badge: BadgeItem
  onClose: () => void
}) {
  const progress = badge.max_copies > 0 ? (badge.copies_sold / badge.max_copies) * 100 : 0

  const handleBuy = () => {
    if (badge.purchase_url) {
      window.open(badge.purchase_url, "_blank")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground truncate px-4">
            {badge.name}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4 overflow-hidden"
              style={{
                backgroundColor: badge.color_upgrade
                  ? `${badge.color_upgrade}20`
                  : "var(--secondary)",
              }}
            >
              {badge.image_path ? (
                <img
                  src={`${API_IMAGE_BASE}/static/uploads/badges/${badge.image_path}`}
                  alt={badge.name}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Sparkles
                  className="h-12 w-12"
                  style={{ color: badge.color_upgrade || "var(--primary)" }}
                />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {badge.name}
            </h1>
            {badge.upgrade && (
              <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                {badge.upgrade}
              </Badge>
            )}
            <p className="text-muted-foreground text-sm mb-4">
              {badge.description}
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(badge.price)}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Создатель
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage
                  src={badge.creator.avatar_url || badge.creator.photo || "/placeholder.svg"}
                  alt={badge.creator.name}
                />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {badge.creator.name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {badge.creator.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{badge.creator.username}
                </p>
              </div>
            </div>
          </div>

          {badge.max_copies > 0 && (
            <div className="bg-secondary/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Доступность</span>
                <span className="text-sm font-medium text-foreground">
                  {badge.copies_sold} / {badge.max_copies}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Осталось {badge.max_copies - badge.copies_sold} шт.
              </p>
            </div>
          )}

          {badge.purchases && badge.purchases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Владельцы ({badge.purchases.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-auto">
                {badge.purchases.map((purchase) => (
                  <div
                    key={purchase.buyer_id}
                    className="flex items-center justify-between bg-secondary/50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={purchase.buyer.avatar_url || purchase.buyer.photo || "/placeholder.svg"}
                          alt={purchase.buyer.name}
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {purchase.buyer.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {purchase.buyer.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(purchase.purchase_date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!badge.is_sold_out && (
            <Button
              onClick={handleBuy}
              className="w-full h-12 text-base font-semibold"
            >
              Купить за {formatPrice(badge.price)}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}

          {badge.is_sold_out && (
            <div className="w-full h-12 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground font-medium">
              Распродано
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CartSidebar({
  items,
  onRemove,
  onClose,
  isOpen,
}: {
  items: CartItem[]
  onRemove: (id: number, type: "username" | "badge") => void
  onClose: () => void
  isOpen: boolean
}) {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close cart"
      />
      <div className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Корзина ({items.length})
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
              <p>Корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3"
                >
                  {item.type === "badge" && item.image ? (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                      <img
                        src={`${API_IMAGE_BASE}/static/uploads/badges/${item.image}`}
                        alt={item.name}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">@</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.type === "username" ? `@${item.name}` : item.name}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id, item.type)}
                    type="button"
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Итого</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Нажмите на товар в списке для покупки
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<TabType>("usernames")
  const [listings, setListings] = useState<Listing[]>([])
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [trendingBadges, setTrendingBadges] = useState<BadgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortType>("newest")
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [listingsRes, badgesRes, trendingRes] = await Promise.all([
          fetch("/api/marketplace?status=active"),
          fetch("/api/badges"),
          fetch("/api/badges/trending"),
        ])

        const [listingsData, badgesData, trendingData] = await Promise.all([
          listingsRes.json(),
          badgesRes.json(),
          trendingRes.json(),
        ])

        if (listingsData.success) {
          setListings(listingsData.listings)
        }
        if (badgesData.badges) {
          setBadges(badgesData.badges)
        }
        if (trendingData.badges) {
          setTrendingBadges(trendingData.badges)
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredListings = useMemo(() => {
    let filtered = listings.filter(
      (listing) =>
        listing.username.toLowerCase().includes(search.toLowerCase()) ||
        listing.seller.name.toLowerCase().includes(search.toLowerCase())
    )

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case "popular":
        filtered.sort((a, b) => a.username.length - b.username.length)
        break
    }

    return filtered
  }, [listings, search, sortBy])

  const filteredBadges = useMemo(() => {
    let filtered = badges.filter(
      (badge) =>
        badge.name.toLowerCase().includes(search.toLowerCase()) ||
        badge.creator.name.toLowerCase().includes(search.toLowerCase())
    )

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        break
      case "popular":
        filtered.sort((a, b) => b.copies_sold - a.copies_sold)
        break
    }

    return filtered
  }, [badges, search, sortBy])

  const stats = useMemo(() => {
    const usernameValue = listings.reduce((sum, l) => sum + l.price, 0)
    const badgeValue = badges.reduce((sum, b) => sum + b.price, 0)
    return {
      usernameCount: listings.length,
      badgeCount: badges.length,
      totalValue: usernameValue + badgeValue,
      trendingCount: trendingBadges.length,
    }
  }, [listings, badges, trendingBadges])

  const addToCart = (item: CartItem) => {
    if (!cart.find((c) => c.id === item.id && c.type === item.type)) {
      setCart([...cart, item])
    }
  }

  const removeFromCart = (id: number, type: "username" | "badge") => {
    setCart(cart.filter((c) => !(c.id === id && c.type === type)))
  }

  const isInCart = (id: number, type: "username" | "badge") => {
    return cart.some((c) => c.id === id && c.type === type)
  }

  const sortOptions = [
    { value: "newest", label: "Сначала новые" },
    { value: "price-asc", label: "Сначала дешевые" },
    { value: "price-desc", label: "Сначала дорогие" },
    { value: "popular", label: "Популярные" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              SRC Market
            </h1>
            <button
              onClick={() => setCartOpen(true)}
              type="button"
              className="relative p-2 hover:bg-secondary rounded-xl transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-4">
            <button
              onClick={() => setActiveTab("usernames")}
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "usernames"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tag className="h-4 w-4 inline mr-2" />
              Юзернеймы
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === "badges"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Бейджики
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={
                  activeTab === "usernames"
                    ? "Поиск юзернеймов..."
                    : "Поиск бейджиков..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border h-11"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="h-11 gap-2 bg-transparent"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Сортировка</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as SortType)
                        setShowSortMenu(false)
                      }}
                      type="button"
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        sortBy === option.value
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <MarketStats {...stats} />

        {activeTab === "badges" && trendingBadges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              В тренде
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {trendingBadges.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  type="button"
                  className="flex-shrink-0 w-64 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-left hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                      {badge.image_path ? (
                        <img
                          src={`${API_IMAGE_BASE}/static/uploads/badges/${badge.image_path}`}
                          alt={badge.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Sparkles className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {badge.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {badge.copies_sold} продано
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(badge.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : activeTab === "usernames" ? (
          filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">
                Ничего не найдено
              </p>
              <p className="text-muted-foreground">
                {search ? "Попробуйте изменить запрос" : "Нет активных объявлений"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <UsernameCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => setSelectedListing(listing)}
                  onAddToCart={() =>
                    addToCart({
                      type: "username",
                      id: listing.id,
                      name: listing.username,
                      price: listing.price,
                      purchase_url: listing.purchase_url,
                    })
                  }
                  isInCart={isInCart(listing.id, "username")}
                />
              ))}
            </div>
          )
        ) : filteredBadges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">
              Ничего не найдено
            </p>
            <p className="text-muted-foreground">
              {search ? "Попробуйте изменить запрос" : "Нет доступных бейджиков"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => setSelectedBadge(badge)}
                onAddToCart={() =>
                  addToCart({
                    type: "badge",
                    id: badge.id,
                    name: badge.name,
                    price: badge.price,
                    image: badge.image_path,
                    purchase_url: badge.purchase_url,
                  })
                }
                isInCart={isInCart(badge.id, "badge")}
              />
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <UsernameModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {selectedBadge && (
        <BadgeModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      <CartSidebar
        items={cart}
        onRemove={removeFromCart}
        onClose={() => setCartOpen(false)}
        isOpen={cartOpen}
      />
    </main>
  )
}
