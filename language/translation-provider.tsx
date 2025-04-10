// contexts/TranslationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define available languages
export type Language = "en" | "km" | "zh";

// Create translation context type
type TranslationContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string }[];
};

// Create the context
const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

// Translation data
const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    "app.name": "Smart Shop Admin",
    "app.dashboard": "Dashboard",
    "app.categories": "Categories",
    "app.products": "Products",
    "app.orders": "Orders",
    "app.delivery": "Delivery Methods",
    "app.banners": "Banners",
    "app.settings": "Settings",

    // Auth
    "auth.signin": "Sign in to your account",
    "auth.enterCredentials":
      "Enter your credentials to access your admin dashboard",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot your password?",
    "auth.rememberMe": "Remember me",
    "auth.signin.button": "Sign in",
    "auth.signin.loading": "Signing in...",

    // Form Actions
    "action.save": "Save Changes",
    "action.create": "Create",
    "action.update": "Update",
    "action.delete": "Delete",
    "action.cancel": "Cancel",
    "action.add": "Add",
    "action.edit": "Edit",
    "action.view": "View",

    // Status
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.all": "All Status",

    // Other common labels
    "common.search": "Search",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    "common.noData": "No data found",

    // Confirmation
    "confirm.delete":
      "Are you sure you want to delete this item? This action cannot be undone.",
    "confirm.title": "Confirmation",
    "confirm.yes": "Yes",
    "confirm.no": "No",
  },
  km: {
    // General
    "app.name": "រដ្ឋបាលហាងឆ្លាត",
    "app.dashboard": "ផ្ទាំងគ្រប់គ្រង",
    "app.categories": "ប្រភេទ",
    "app.products": "ផលិតផល",
    "app.orders": "ការបញ្ជាទិញ",
    "app.delivery": "វិធីសាស្ត្រដឹកជញ្ជូន",
    "app.banners": "បដា",
    "app.settings": "ការកំណត់",

    // Auth
    "auth.signin": "ចូលគណនីរបស់អ្នក",
    "auth.enterCredentials":
      "បញ្ចូលព័ត៌មានសម្ងាត់របស់អ្នកដើម្បីចូលប្រើផ្ទាំងគ្រប់គ្រងរបស់អ្នក",
    "auth.email": "អ៊ីមែល",
    "auth.password": "ពាក្យសម្ងាត់",
    "auth.forgotPassword": "ភ្លេចពាក្យសម្ងាត់របស់អ្នក?",
    "auth.rememberMe": "ចងចាំខ្ញុំ",
    "auth.signin.button": "ចូល",
    "auth.signin.loading": "កំពុងចូល...",

    // Form Actions
    "action.save": "រក្សាទុកការផ្លាស់ប្តូរ",
    "action.create": "បង្កើត",
    "action.update": "ធ្វើបច្ចុប្បន្នភាព",
    "action.delete": "លុប",
    "action.cancel": "បោះបង់",
    "action.add": "បន្ថែម",
    "action.edit": "កែសម្រួល",
    "action.view": "មើល",

    // Status
    "status.active": "សកម្ម",
    "status.inactive": "អសកម្ម",
    "status.all": "ស្ថានភាពទាំងអស់",

    // Other common labels
    "common.search": "ស្វែងរក",
    "common.filter": "ចម្រាញ់",
    "common.loading": "កំពុងផ្ទុក...",
    "common.noData": "មិនមានទិន្នន័យទេ",

    // Confirmation
    "confirm.delete":
      "តើអ្នកពិតជាចង់លុបធាតុនេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។",
    "confirm.title": "ការបញ្ជាក់",
    "confirm.yes": "បាទ/ចាស",
    "confirm.no": "ទេ",
  },
  zh: {
    // General
    "app.name": "智能商店管理",
    "app.dashboard": "儀表板",
    "app.categories": "類別",
    "app.products": "產品",
    "app.orders": "訂單",
    "app.delivery": "配送方式",
    "app.banners": "橫幅",
    "app.settings": "設置",

    // Auth
    "auth.signin": "登錄到您的賬戶",
    "auth.enterCredentials": "輸入您的憑據以訪問您的管理儀表板",
    "auth.email": "電子郵件",
    "auth.password": "密碼",
    "auth.forgotPassword": "忘記密碼？",
    "auth.rememberMe": "記住我",
    "auth.signin.button": "登錄",
    "auth.signin.loading": "登錄中...",

    // Form Actions
    "action.save": "保存更改",
    "action.create": "創建",
    "action.update": "更新",
    "action.delete": "刪除",
    "action.cancel": "取消",
    "action.add": "添加",
    "action.edit": "編輯",
    "action.view": "查看",

    // Status
    "status.active": "活躍",
    "status.inactive": "非活躍",
    "status.all": "所有狀態",

    // Other common labels
    "common.search": "搜索",
    "common.filter": "篩選",
    "common.loading": "加載中...",
    "common.noData": "未找到數據",

    // Confirmation
    "confirm.delete": "您確定要刪除此項目嗎？此操作無法撤消。",
    "confirm.title": "確認",
    "confirm.yes": "是",
    "confirm.no": "否",
  },
};

// Language options
const languages = [
  { code: "en" as Language, name: "English" },
  { code: "km" as Language, name: "ខ្មែរ" },
  { code: "zh" as Language, name: "中文" },
];

interface TranslationProviderProps {
  children: ReactNode;
}

// Provider component
export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  // Get saved language from localStorage or use default (en)
  const [language, setLanguage] = useState<Language>("en");

  // Update language in localStorage when changed
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (
      savedLanguage &&
      languages.some((lang) => lang.code === savedLanguage)
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem("language", language);
    // Update HTML lang attribute
    document.documentElement.lang = language;
    // Add a data attribute to the body for language-specific styles
    document.body.setAttribute("data-language", language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, t, languages }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook for easy access
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
