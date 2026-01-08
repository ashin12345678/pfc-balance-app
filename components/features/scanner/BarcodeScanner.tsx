'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Camera, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose?: () => void
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return

    try {
      setError(null)
      setIsScanning(true)

      const scanner = new Html5Qrcode('barcode-scanner', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
      })

      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          // バーコード検出成功
          onScan(decodedText)
          stopScanner()
        },
        () => {
          // スキャン中（バーコード未検出）
        }
      )
    } catch (err) {
      console.error('Scanner error:', err)
      setIsScanning(false)
      
      if (err instanceof Error) {
        if (err.message.includes('NotAllowedError') || err.message.includes('Permission')) {
          setError('カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。')
        } else if (err.message.includes('NotFoundError')) {
          setError('カメラが見つかりません。')
          setHasCamera(false)
        } else {
          setError(`カメラの起動に失敗しました: ${err.message}`)
        }
      }
    }
  }, [onScan])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        console.error('Failed to stop scanner:', err)
      }
    }
    setIsScanning(false)
  }, [])

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* スキャナー表示エリア */}
        <div className="relative aspect-video bg-black">
          <div
            id="barcode-scanner"
            ref={containerRef}
            className="h-full w-full"
          />

          {/* スキャン中のオーバーレイ */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded">
                  バーコードを枠内に合わせてください
                </p>
              </div>
            </div>
          )}

          {/* 開始前の表示 */}
          {!isScanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                カメラでバーコードをスキャン
              </p>
              <Button onClick={startScanner} disabled={!hasCamera}>
                <Camera className="mr-2 h-4 w-4" />
                スキャン開始
              </Button>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4">
              <p className="text-destructive text-center mb-4">{error}</p>
              <Button onClick={startScanner} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                再試行
              </Button>
            </div>
          )}

          {/* 閉じるボタン */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              onClick={() => {
                stopScanner()
                onClose()
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* コントロールバー */}
        {isScanning && (
          <div className="p-4 border-t flex justify-center">
            <Button variant="outline" onClick={stopScanner}>
              <X className="mr-2 h-4 w-4" />
              スキャン停止
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
