'use client';

import { useState, useRef, useEffect } from 'react';
import { getContactLinks } from '@/lib/config';

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hoverColor: string;
}

function ContactItem({ icon, label, value, hoverColor }: ContactItemProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        if (!copied) setShowTooltip(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip, copied]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        setShowTooltip(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setShowTooltip(true);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用 execCommand
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setShowTooltip(true);
      } catch {
        console.error('execCommand 复制失败');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 ${hoverColor} transition-colors text-sm md:text-base cursor-pointer select-none`}
        onClick={handleCopy}
        onTouchStart={() => setShowTooltip(true)}
      >
        {icon}
        {label}
      </div>
      <div 
        ref={tooltipRef}
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
          showTooltip || copied ? 'opacity-100' : 'opacity-0'
        } md:group-hover:opacity-100`}
      >
        <span>{value}</span>
        <span className="text-gray-400">
          {copied ? '✓ 已复制' : '点击复制'}
        </span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
}

// 图标组件
const WechatIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.036 2.96c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const iconMap: Record<string, { icon: React.ReactNode; hoverColor: string }> = {
  wechat: { icon: <WechatIcon />, hoverColor: 'hover:text-green-600 dark:hover:text-green-400' },
  email: { icon: <EmailIcon />, hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400' },
  github: { icon: <GitHubIcon />, hoverColor: 'hover:text-gray-900 dark:hover:text-white' },
  twitter: { icon: <TwitterIcon />, hoverColor: 'hover:text-blue-400 dark:hover:text-blue-300' },
};

export default function ContactLinks() {
  const links = getContactLinks();

  if (links.length === 0) {
    return (
      <p className="text-gray-400 dark:text-gray-500 text-sm">
        暂未配置联系方式
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 md:gap-4">
      {links.map((link) => {
        const iconConfig = iconMap[link.type];
        if (!iconConfig) return null;
        
        return (
          <ContactItem
            key={link.type}
            icon={iconConfig.icon}
            label={link.label}
            value={link.value}
            hoverColor={iconConfig.hoverColor}
          />
        );
      })}
    </div>
  );
}
