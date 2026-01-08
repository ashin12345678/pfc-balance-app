'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-8">利用規約</h1>
          
          <p className="text-gray-600 mb-6">
            最終更新日: 2026年1月8日
          </p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第1条（適用）</h2>
              <p className="text-gray-700 leading-relaxed">
                本利用規約（以下「本規約」）は、ashin12345678（以下「運営者」）が提供するPFCバランス管理アプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第2条（利用登録）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>本サービスの利用を希望する方は、本規約に同意の上、運営者の定める方法によって利用登録を行うものとします。</li>
                <li>利用登録の際には、正確な情報を提供してください。</li>
                <li>登録情報に変更があった場合は、速やかに更新してください。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第3条（アカウント管理）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>ユーザーは、自己の責任においてアカウント情報を適切に管理するものとします。</li>
                <li>アカウント情報を第三者に利用させ、または貸与、譲渡、売買等をしてはなりません。</li>
                <li>パスワードの管理不十分、第三者の使用等による損害の責任は、ユーザーが負うものとします。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第4条（禁止事項）</h2>
              <p className="text-gray-700 mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>本サービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>運営者のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第5条（本サービスの提供の停止等）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
                <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第6条（免責事項）</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ 医療に関する重要なお知らせ
                </p>
                <p className="text-yellow-700 mt-2">
                  本サービスは、健康管理の補助を目的としたものであり、医療アドバイス、診断、治療の代替となるものではありません。健康上の問題や懸念がある場合は、必ず医師または医療専門家にご相談ください。
                </p>
              </div>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。</li>
                <li>本サービスで提供される栄養情報、カロリー計算、AIによる食事解析結果は参考値であり、正確性を保証するものではありません。</li>
                <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第7条（サービス内容の変更等）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第8条（利用規約の変更）</h2>
              <p className="text-gray-700 leading-relaxed">
                運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本サービス上に掲載された時点で効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第9条（準拠法・裁判管轄）</h2>
              <p className="text-gray-700 leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">第10条（お問い合わせ）</h2>
              <p className="text-gray-700 leading-relaxed">
                本規約に関するお問い合わせは、下記までご連絡ください。
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">運営者: ashin12345678</p>
                <p className="text-gray-700">メール: h.tsukada910@gmail.com</p>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/privacy" className="text-blue-600 hover:underline">
            プライバシーポリシーを見る →
          </Link>
        </div>
      </div>
    </div>
  )
}
