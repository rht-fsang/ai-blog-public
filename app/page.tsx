import Link from "next/link";
import Image from "next/image";
import ContactLinks from "@/components/ContactLinks";
import { siteConfig } from "@/lib/config";

export default function HomePage() {
  const { owner, skills } = siteConfig;

  return (
    <main className="container mx-auto p-4 max-w-3xl py-8 md:py-12">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 md:p-8">
        {/* 头像区域 */}
        <div className="text-center mb-6 md:mb-8">
          <Image
            src={owner.avatar}
            alt={`${owner.name}头像`}
            width={96}
            height={96}
            className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full object-cover mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {owner.name} ({owner.nickname})
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            {owner.title}
          </p>
        </div>

        {/* AI 对话入口 */}
        <div className="mb-6 md:mb-8 p-4 md:p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm md:text-base">
            有问题想问我？试试和我的 AI 分身对话吧！
          </p>
          <Link
            href="/chat"
            className="inline-block px-5 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            开始对话 💬
          </Link>
        </div>

        {/* 简介 */}
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 space-y-3 md:space-y-4 text-sm md:text-base">
            {owner.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* 技能标签 */}
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
              技术栈
            </h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 md:px-3 py-0.5 md:py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* 联系方式 */}
          <div className="mt-6 md:mt-8">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
              联系我
            </h3>
            <ContactLinks />
          </div>
        </div>
      </div>
    </main>
  );
}
