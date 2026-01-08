'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              トップに戻る
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
          
          <p className="text-gray-600 mb-6">
            最終更新日: 2026年1月8日
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. はじめに</h2>
              <p className="text-gray-700 leading-relaxed">
                ashin12345678（以下「運営者」）は、PFCバランス管理アプリ（以下「本サービス」）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. 収集する情報</h2>
              <p className="text-gray-700 mb-4">
                本サービスでは、以下の情報を収集・保存します。これらの情報は運営者がデータベース管理画面で閲覧可能です。
              </p>
              
              <h3 className="text-lg font-medium mb-2 mt-4">2.1 アカウント情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>メールアドレス</li>
                <li>表示名（お名前）</li>
                <li>アカウント作成日時</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">2.2 プロフィール情報</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>生年月日</li>
                <li>身長</li>
                <li>体重・目標体重</li>
                <li>性別</li>
                <li>活動レベル</li>
                <li>目標（減量・維持・増量）</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">2.3 食事記録</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>食事内容（テキスト入力）</li>
                <li>食事の種類（朝食・昼食・夕食・間食）</li>
                <li>カロリー・栄養素情報（P/F/C）</li>
                <li>記録日時</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. 情報の利用目的</h2>
              <p className="text-gray-700 mb-2">収集した情報は、以下の目的で利用します。</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>本サービスの提供・運営のため</li>
                <li>ユーザーの栄養管理・目標達成をサポートするため</li>
                <li>サービスの改善・新機能の開発のため</li>
                <li>お問い合わせに対応するため</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. 第三者への情報提供</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                運営者は、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、以下の場合を除きます。
              </p>
              
              <h3 className="text-lg font-medium mb-2 mt-4">4.1 AI食事解析機能</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800">
                  食事内容のテキスト入力時、その内容は栄養解析のため <strong>Google Gemini API</strong> に送信されます。送信されるのは食事内容のテキストのみであり、ユーザーを特定できる情報（メールアドレス、名前等）は送信されません。
                </p>
              </div>

              <h3 className="text-lg font-medium mb-2 mt-4">4.2 法令に基づく開示</h3>
              <p className="text-gray-700">
                法令に基づき開示が必要な場合、または人の生命・身体・財産の保護のために必要な場合は、情報を開示することがあります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. データの保管</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>ユーザーのデータは、Supabase（クラウドデータベースサービス）に保管されます。</li>
                <li>データは暗号化された通信（HTTPS）を通じて送受信されます。</li>
                <li>パスワードはハッシュ化されて保存され、運営者を含め誰も閲覧できません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. データの削除</h2>
              <p className="text-gray-700 leading-relaxed">
                ユーザーがアカウントを削除した場合、当該ユーザーに関連するすべてのデータ（プロフィール情報、食事記録等）はデータベースから完全に削除されます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Cookie（クッキー）について</h2>
              <p className="text-gray-700 leading-relaxed">
                本サービスでは、ログイン状態の維持のためにCookieを使用しています。Cookieはブラウザの設定により無効化できますが、その場合本サービスの一部機能が利用できなくなる可能性があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. セキュリティ</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。ただし、インターネット上の通信は完全に安全であることを保証するものではありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-700 leading-relaxed">
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができるものとします。変更後のプライバシーポリシーは、本サービス上に掲載したときから効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. お問い合わせ</h2>
              <p className="text-gray-700 leading-relaxed">
                本ポリシーに関するお問い合わせは、下記までご連絡ください。
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">運営者: ashin12345678</p>
                <p className="text-gray-700">メール: h.tsukada910@gmail.com</p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/terms" className="text-blue-600 hover:underline">
            利用規約を見る →
          </Link>
        </div>
      </div>
    </div>
  )
}
