export type SupportedLanguage = "bn" | "en";

export type TranslationSections = {
  intro: {
    slide1: string;
    slide2: string;
    slide3: string;
    cta: string;
  };
  actions: {
    joinJourney: string;
    continue: string;
    switchToEnglish: string;
    switchToBangla: string;
    save: string;
    cancel: string;
  };
  ui: {
    loadingStory: string;
    redirecting: string;
    brandTagline: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    weatherModuleTitle: string;
    scannerTitle: string;
    batchTitle: string;
    heroCta: string;
  };
  weather: {
    defaultMessage: string;
    rainAlert: (percentage: number) => string;
    tempLabel: string;
    humidityLabel: string;
    rainLabel: string;
  };
  scanner: {
    scanning: string;
    fresh: string;
    rotten: string;
    uploadPrompt: string;
    startScan: string;
  };
  batch: {
    cropLabel: string;
    weightLabel: string;
    storageLabel: string;
    harvestDateLabel: string;
    addBatch: string;
    syncBatches: string;
    pendingSync: string;
    synced: string;
    empty: string;
    cropOptions: {
      rice: string;
      paddy: string;
    };
    storageOptions: {
      silo: string;
      bag: string;
    };
    syncAlready: string;
    syncSuccess: string;
    syncFailed: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    phoneLabel: string;
    districtLabel: string;
    upazilaLabel: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    loginButton: string;
    registerButton: string;
    loginSuccess: string;
    registerSuccess: string;
  };
};

type TranslationConfig = {
  [K in SupportedLanguage]: {
    localeLabel: string;
    sections: TranslationSections;
  };
};

export const translations: TranslationConfig = {
  bn: {
    localeLabel: "বাংলা",
    sections: {
      intro: {
        slide1:
          "ফসল ফলানো সহজ নয়, কিন্তু তা হারানো খুব কষ্টের...",
        slide2:
          "প্রতি বছর আমরা লক্ষ লক্ষ টন খাবার নষ্ট করছি...",
        slide3: "আমাদের সাথে যোগ দিন, আপনার ফসল রক্ষা করুন।",
        cta: "ফসলরক্ষায় আমাদের সাথে থাকুন",
      },
      actions: {
        joinJourney: "যাত্রা শুরু করুন",
        continue: "আগে যান",
        switchToEnglish: "Switch to English",
        switchToBangla: "বাংলায় ফিরুন",
        save: "সংরক্ষণ করুন",
        cancel: "বাতিল",
      },
      ui: {
        loadingStory: "গল্প প্রস্তুত হচ্ছে",
        redirecting: "আপনাকে রিডাইরেক্ট করা হচ্ছে",
        brandTagline: "বাংলাদেশের খাদ্য নিরাপত্তা যাত্রা",
      },
      dashboard: {
        title: "ফসলরক্ষা ড্যাশবোর্ড",
        subtitle: "আবহাওয়া, স্বাস্থ্য, এবং সংরক্ষণ একসাথে",
        weatherModuleTitle: "আবহাওয়া বন্ধু",
        scannerTitle: "ফসল স্বাস্থ্য স্ক্যানার",
        batchTitle: "ব্যাচ ব্যবস্থাপনা",
        heroCta: "ড্যাশবোর্ডে যান",
      },
      weather: {
        defaultMessage: "তথ্য সংগ্রহ করা হচ্ছে...",
        rainAlert: (percentage: number) =>
          `আগামী ৩ দিনে বৃষ্টির সম্ভাবনা ${percentage}%। আজই ধান কাটুন অথবা ঢেকে রাখুন।`,
        tempLabel: "তাপমাত্রা",
        humidityLabel: "আর্দ্রতা",
        rainLabel: "বৃষ্টি",
      },
      scanner: {
        scanning: "স্ক্যান চলছে...",
        fresh: "ফসল ভালো অবস্থায় আছে",
        rotten: "ফসল নষ্টের আশঙ্কা",
        uploadPrompt: "ছবি তুলুন অথবা আপলোড করুন",
        startScan: "স্ক্যান শুরু করুন",
      },
      batch: {
        cropLabel: "ফসলের ধরন",
        weightLabel: "ওজন (কেজি)",
        storageLabel: "সংরক্ষণ পদ্ধতি",
        harvestDateLabel: "কাটা তারিখ",
        addBatch: "ব্যাচ যোগ করুন",
        syncBatches: "সুপাবেসে সিঙ্ক করুন",
        pendingSync: "অপেক্ষমাণ",
        synced: "সফল",
        empty: "কোনো ব্যাচ নেই। উপরের ফর্ম দিয়ে শুরু করুন।",
        cropOptions: {
          rice: "ধান",
          paddy: "প্যাডি",
        },
        storageOptions: {
          silo: "সাইলো",
          bag: "বস্তা",
        },
        syncAlready: "সব ব্যাচ ইতিমধ্যে সিঙ্ক হয়েছে।",
        syncSuccess: "ব্যাচগুলো সফলভাবে সিঙ্ক হয়েছে।",
        syncFailed: "সিঙ্ক ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।",
      },
      auth: {
        loginTitle: "ফসলরক্ষা অ্যাকাউন্টে প্রবেশ করুন",
        registerTitle: "নতুন কৃষক নিবন্ধন",
        nameLabel: "নাম",
        phoneLabel: "ফোন নম্বর",
        districtLabel: "জেলা",
        upazilaLabel: "উপজেলা",
        emailLabel: "ইমেইল",
        passwordLabel: "পাসওয়ার্ড",
        loginButton: "লগইন করুন",
        registerButton: "নিবন্ধন করুন",
        loginSuccess: "সফলভাবে লগইন হয়েছে। ড্যাশবোর্ডে যাচ্ছেন...",
        registerSuccess: "নিবন্ধন সফল। আপনার ইমেইল যাচাই করুন।",
      },
    },
  },
  en: {
    localeLabel: "English",
    sections: {
      intro: {
        slide1:
          "Growing crops is never easy, but losing them hurts the most.",
        slide2: "Every year we waste millions of tons of food.",
        slide3: "Join us to protect your harvest.",
        cta: "Stand with HarvestGuard",
      },
      actions: {
        joinJourney: "Join the Journey",
        continue: "Continue",
        switchToEnglish: "Switch to English",
        switchToBangla: "Switch to Bangla",
        save: "Save",
        cancel: "Cancel",
      },
      ui: {
        loadingStory: "Preparing story",
        redirecting: "Redirecting you",
        brandTagline: "Bangladesh food security mission",
      },
      dashboard: {
        title: "HarvestGuard Dashboard",
        subtitle: "Weather, health, and storage at a glance.",
        weatherModuleTitle: "Abohawa Bondhu",
        scannerTitle: "Crop Health Scanner",
        batchTitle: "Batch Management",
        heroCta: "Enter Dashboard",
      },
      weather: {
        defaultMessage: "Fetching insights...",
        rainAlert: (percentage: number) =>
          `Rain probability is ${percentage}% in the next 3 days. Harvest or cover crops now.`,
        tempLabel: "Temp",
        humidityLabel: "Humidity",
        rainLabel: "Rain",
      },
      scanner: {
        scanning: "Scanning...",
        fresh: "Batch looks healthy",
        rotten: "Signs of spoilage detected",
        uploadPrompt: "Capture or upload a crop photo",
        startScan: "Start Scan",
      },
      batch: {
        cropLabel: "Crop Type",
        weightLabel: "Weight (kg)",
        storageLabel: "Storage Method",
        harvestDateLabel: "Harvest Date",
        addBatch: "Add Batch",
        syncBatches: "Sync to Supabase",
        pendingSync: "Pending",
        synced: "Synced",
        empty: "No batches yet. Use the form above to add one.",
        cropOptions: {
          rice: "Rice",
          paddy: "Paddy",
        },
        storageOptions: {
          silo: "Silo",
          bag: "Bag",
        },
        syncAlready: "All batches are already synced.",
        syncSuccess: "Batches synced successfully.",
        syncFailed: "Sync failed. Try again later.",
      },
      auth: {
        loginTitle: "Sign in to HarvestGuard",
        registerTitle: "New Farmer Registration",
        nameLabel: "Name",
        phoneLabel: "Phone Number",
        districtLabel: "District",
        upazilaLabel: "Upazila",
        emailLabel: "Email",
        passwordLabel: "Password",
        loginButton: "Login",
        registerButton: "Register",
        loginSuccess: "Login successful. Redirecting to dashboard...",
        registerSuccess: "Registration successful. Please verify your email.",
      },
    },
  },
};

export const DEFAULT_LANGUAGE: SupportedLanguage = "bn";

