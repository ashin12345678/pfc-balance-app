import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart2, Camera, Utensils, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* ヘッダー */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥗</span>
            <span className="font-bold text-xl">PFC管理</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button>新規登録</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI で簡単
          <br />
          <span className="text-primary">PFC バランス管理</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          食事を入力するだけで、AIがタンパク質・脂質・炭水化物を自動計算。
          <br />
          あなたのダイエットを科学的にサポートします。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              ログイン
            </Button>
          </Link>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* AI解析 */}
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI自然言語解析</h3>
            <p className="text-muted-foreground text-sm">
              「サラダチキンと玄米おにぎり」と入力するだけで、AIが栄養成分を自動計算
            </p>
          </div>

          {/* バーコード */}
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">バーコードスキャン</h3>
            <p className="text-muted-foreground text-sm">
              コンビニ商品もカメラでスキャンするだけで栄養情報を取得
            </p>
          </div>

          {/* グラフ */}
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">可視化グラフ</h3>
            <p className="text-muted-foreground text-sm">
              日別・週別のPFCバランスと目標達成度をグラフで確認
            </p>
          </div>

          {/* アドバイス */}
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">パーソナルアドバイス</h3>
            <p className="text-muted-foreground text-sm">
              不足栄養素に基づいた具体的な食事提案をAIがお届け
            </p>
          </div>
        </div>
      </section>

      {/* ユーザー情報セクション */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-card rounded-2xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            あなたに最適な目標を自動計算
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">BMR</div>
              <div className="text-sm text-muted-foreground">
                Mifflin-St Jeor式で
                <br />
                基礎代謝を正確に計算
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">TDEE</div>
              <div className="text-sm text-muted-foreground">
                活動レベルに応じた
                <br />
                消費カロリーを算出
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">PFC</div>
              <div className="text-sm text-muted-foreground">
                目的に合わせた最適な
                <br />
                栄養バランスを提案
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">今すぐ始めよう</h2>
        <p className="text-muted-foreground mb-8">無料で登録、すぐに使い始められます</p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-12">
            無料で始める
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* フッター */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 PFCバランス管理アプリ. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
